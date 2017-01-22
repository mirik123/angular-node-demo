import fs = require('fs');
import _ = require("lodash");
import crypto = require('crypto');
import { DB, Record } from './db/authdb';

export class Utils {
    static session = {};

    static init() {
        DB.init();
    }

    static hash(password: string, salt: string) {
        return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha1').toString('hex');
    }

    static random() {
        return crypto.randomBytes(32).toString('hex');
    }

    static seed() {
        DB.removeall();

        var salt = Utils.random();
        DB.add({
            username: 'admin',
            email: 'admin@com',
            birthdate: new Date().toISOString(),
            permissions: 'admin',
            salt: salt,
            password: Utils.hash('123', salt)
        });

        salt = Utils.random();
        DB.add({
            username: 'user',
            email: 'user@com',
            birthdate: new Date().toISOString(),
            permissions: 'user',
            salt: salt,
            password: Utils.hash('123', salt)
        });

        DB.save();
    }

    static login(username: string, pass: string, ip: string): any[] {
        var record = DB.findbyname(username);
        if (record && record.password === Utils.hash(pass, record.salt)) {
            var sessionid = Utils.random();
            Utils.session[sessionid] = [record.permissions, username, ip];

            DB.update({
                username: username,
                loginsuccesson: new Date().toISOString(),
                failedlogins: 0,
                loginip: ip
            });

            DB.save();

            return [true, 200, sessionid];
        }

        if (record) {
            DB.update({
                username: username,
                loginfailureon: new Date().toISOString(),
                failedlogins: (record.failedlogins || 0) + 1
            });

            DB.save();
        }

        return [false, 401, 'user not found or password is incorrect'];
    }

    static logout(authtoken: string):void {
        delete Utils.session[authtoken];
    }

    static validate(authtoken: string): any[] {
        return !authtoken || !Utils.session[authtoken] ? [false, 401, 'session is invalid'] : [true, 200, Utils.session[authtoken]];
    }

    static add(record: Record, authtoken: string): any[] {
        if (DB.findbyname(record.username)) return [false, 500, 'user already exists'];
        if (authtoken && Utils.session[authtoken][0] !== 'admin') return [false, 403, 'operation requires special permission'];

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

        DB.add(newrecord);
        DB.save();

        if (!authtoken) {
            var sessionid = Utils.random();
            Utils.session[sessionid] = ['user', record.username, record.loginip];
            return [true, 200, sessionid];
        }

        return [true, 200, ''];
    }

    static remove(username: string, authtoken: string): any[] {
        if (!DB.findbyname(username)) return [false, 401, 'user not found or password is incorrect'];
        if (Utils.session[authtoken][0] !== 'admin') return [false, 403, 'operation requires special permission'];
        if (Utils.session[authtoken][1] === username) return [false, 500, 'you cannot remove yourself'];

        DB.remove(username);
        DB.save();

        return [true, 200, ''];
    }

    static getsingle(authtoken: string): any[] {       
        var user = Utils.session[authtoken][1];
        var record = DB.findbyname(user);
        if (!record) return [false, 401, 'user not found or password is incorrect'];

        var record2 = _.omit(record, ['password', 'salt']);
        return [true, 200, record2];
    }

    static getall(authtoken: string): any[] {
        if (Utils.session[authtoken][0] !== 'admin') return [false, 403, <any>'operation requires special permission'];

        var res = _.map(DB.findall(), (itm: any, key) => {
            itm = _.omit(itm, ['password', 'salt']);
            return itm;
        });

        return [true, 200, res];
    }

    static update(record: Record, authtoken: string): any[] {
        var oldrecord = DB.findbyname(record.username);
        if (!oldrecord) return [false, 401, 'user not found or password is incorrect'];
        if (Utils.session[authtoken][0] !== 'admin' && Utils.session[authtoken][1] !== record.username) return [false, 403, 'operation requires special permission'];

        if (record.password) {
            var salt = Utils.random();
            oldrecord.salt = salt;
            oldrecord.password = Utils.hash(record.password, salt);
        }

        if (record.permissions && Utils.session[authtoken][0] === 'admin') oldrecord.permissions = record.permissions;

        oldrecord.email = record.email;
        oldrecord.birthdate = record.birthdate;
        oldrecord.updatedon = new Date().toISOString();

        DB.update(oldrecord);
        DB.save();

        return [true, 200, ''];
    }
}