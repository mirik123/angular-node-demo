import fs = require('fs');
import _ = require("lodash");
import crypto = require('crypto');
import mongoose = require('mongoose');
import { DB, Record } from './db/authdb';

export class Utils {
    static session = {};

    static init() {
        var promise = DB.init();
        //if (promise) promise.then(args => Utils.seed());
    }

    static close() {
        DB.close();
    }

    static hash(password: string, salt: string) {
        return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha1').toString('hex');
    }

    static random() {
        return crypto.randomBytes(32).toString('hex');
    }

    static seed() {
        var salt1 = Utils.random();
        var salt2 = Utils.random();
        
        return DB.removeall()
            .then(args => DB.add({
                username: 'admin',
                email: 'admin@com',
                birthdate: new Date().toISOString(),
                permissions: 'admin',
                salt: salt1,
                password: Utils.hash('123', salt1)
            }))
            .then(args => DB.add({
                username: 'user',
                email: 'user@com',
                birthdate: new Date().toISOString(),
                permissions: 'user',
                salt: salt2,
                password: Utils.hash('123', salt2)
            }));
    }

    static login(username: string, pass: string, ip: string) {
        var sessionid = null, permissions = null;

        return DB.findbyname(username)
            .then(doc => {
                if (!doc) throw new Error();

                if (doc.password === Utils.hash(pass, doc.salt)) {
                    permissions = doc.permissions;
                    sessionid = Utils.random();
                    return DB.update({
                            username: doc.username,
                            loginsuccesson: new Date().toISOString(),
                            failedlogins: 0,
                            loginip: ip
                        });
                }

                return DB.update({
                        username: doc.username,
                        loginfailureon: new Date().toISOString(),
                        failedlogins: (doc.failedlogins || 0) + 1
                    })
                    .then<Record>((args) => { throw new Error(); });
            })
            .then(args => {
                Utils.session[sessionid] = [permissions, username, ip];

                return [200, sessionid];
            }, err => {
                console.error('login: ', err);
                return Promise.reject([401, 'user not found or password is incorrect']);
            });
    }

    static logout(authtoken: string):void {
        delete Utils.session[authtoken];
    }

    static validate(authtoken: string): any[] {
        return !authtoken || !Utils.session[authtoken] ? [401, 'session is invalid'] : [200, Utils.session[authtoken]];
    }

    static add(record: Record, authtoken: string) {
        if (authtoken && Utils.session[authtoken][0] !== 'admin') {
            return Promise.reject([403, 'operation requires special permission']);
        }

        return DB.findbyname(record.username)
            .then(doc => {
                if (doc) return Promise.reject([500, 'user already exists']);

                var salt = Utils.random();
                var newrecord: Record = {
                    username: record.username,
                    password: Utils.hash(record.password, salt),
                    salt: salt,
                    permissions: record.permissions,
                    email: record.email,
                    birthdate: record.birthdate,
                    createdon: new Date().toISOString(),
                    updatedon: new Date().toISOString(),
                    failedlogins: 0
                };

                if (!authtoken) {
                    newrecord.loginsuccesson = new Date().toISOString();
                    newrecord.loginip = record.loginip;
                }

                return DB.add(newrecord);
            })
            .then(doc => {
                if (!authtoken) {
                    var sessionid = Utils.random();
                    Utils.session[sessionid] = ['user', record.username, record.loginip];
                    return [200, sessionid];
                }

                return [200, ''];
            }, err => {
                console.error('add: ', err);

                if (_.isArray(err) && err.length === 2) {
                    return Promise.reject(err);
                }

                return Promise.reject([500, 'internal error']);
            });
    }

    static remove(username: string, authtoken: string) {
        if (Utils.session[authtoken][0] !== 'admin') {
            return Promise.reject([403, 'operation requires special permission']);
        }

        if (Utils.session[authtoken][1] === username) {
            return Promise.reject([500, 'you cannot remove yourself']);
        }

        return DB.findbyname(username)
            .then(doc => {
                if (!doc) return Promise.reject([401, 'user not found or password is incorrect']);
                return DB.remove(username);
            })
            .then(doc => {
                return [200, ''];
            }, err => {
                console.error('remove: ', err);

                if (_.isArray(err) && err.length === 2) {
                    return Promise.reject(err);
                }

                return Promise.reject([500, 'internal error']);
            });
    }

    static getsingle(authtoken: string) {       
        var user = Utils.session[authtoken][1];
        return DB.findbyname(user)
            .then(doc => {
                if (!doc) return Promise.reject([401, 'user not found or password is incorrect']);

                var record = _.omit(doc, ['password', 'salt', '_id', '__v']);
                return Promise.resolve([200, record]);
            }, err => {
                console.error('getsingle: ', err);
                return Promise.reject([401, 'user not found or password is incorrect']);
            });
    }

    static getall(authtoken: string) {
        if (Utils.session[authtoken][0] !== 'admin') {
            return Promise.reject([403, 'operation requires special permission']);
        }

        return DB.findall()
            .then(docs => {
                if (!docs) return Promise.reject([500, 'no users found']);

                var res = <any>_.map(docs, (itm: any, key) => {
                    itm = _.omit(itm, ['password', 'salt', '_id', '__v']);
                    return itm;
                });

                return Promise.resolve([200, res]);
            }, err => {
                console.error('getall: ', err);
                return Promise.reject([500, 'no users found']);
            });
    }

    static update(record: Record, authtoken: string) {
        if (Utils.session[authtoken][0] !== 'admin' && Utils.session[authtoken][1] !== record.username) {
            return Promise.reject([403, 'operation requires special permission']);
        }

        return DB.findbyname(record.username)
            .then(doc => {
                if (!doc) throw new Error();

                if (record.password) {
                    var salt = Utils.random();
                    doc.salt = salt;
                    doc.password = Utils.hash(record.password, salt);
                }

                if (record.permissions && Utils.session[authtoken][0] === 'admin') doc.permissions = record.permissions;

                doc.email = record.email;
                doc.birthdate = record.birthdate;
                doc.updatedon = new Date().toISOString();

                return DB.update(doc);
            })
            .then(doc => {
                return [200, ''];
            }, err => {
                console.error('login: ', err);
                return Promise.reject([401, 'user not found or password is incorrect']);
            });
    }
}