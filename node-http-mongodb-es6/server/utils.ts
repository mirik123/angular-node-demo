import fs = require('fs');
import _ = require("lodash");
import crypto = require('crypto');
import mongoose = require('mongoose');
import { DB, Record } from './db/authdb';

export class Utils {
    static session = {};

    static async init(): Promise<void> {
        try {
            await DB.init();
            //await this.seed();
        }
        catch (err) {

        }
    }


    static hash(password: string, salt: string) {
        return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha1').toString('hex');
    }

    static random() {
        return crypto.randomBytes(32).toString('hex');
    }

    static async seed(): Promise<void> {
        await DB.removeall();

        var salt1 = this.random();
        await DB.add({
            username: 'admin',
            email: 'admin@com',
            birthdate: new Date().toISOString(),
            permissions: 'admin',
            salt: salt1,
            password: this.hash('123', salt1)
        });

        var salt2 = this.random();
        await DB.add({
            username: 'user',
            email: 'user@com',
            birthdate: new Date().toISOString(),
            permissions: 'user',
            salt: salt2,
            password: this.hash('123', salt2)
        });
    }

    static async login(username: string, pass: string, ip: string): Promise<any[]> {
        var sessionid = null, permissions = null;

        var doc = await DB.findbyname(username);
        if (!doc) return Promise.reject([401, 'user not found or password is incorrect']);

        if (doc.password === this.hash(pass, doc.salt)) {
            permissions = doc.permissions;
            sessionid = this.random();
            await DB.update({
                username: doc.username,
                loginsuccesson: new Date().toISOString(),
                failedlogins: 0,
                loginip: ip
            });
        }
        else {
            await DB.update({
                username: doc.username,
                loginfailureon: new Date().toISOString(),
                failedlogins: (doc.failedlogins || 0) + 1
            });
            return Promise.reject([401, 'user not found or password is incorrect']);
        }

        this.session[sessionid] = [permissions, username, ip];

        return [200, sessionid];
    }

    static logout(authtoken: string):void {
        delete this.session[authtoken];
    }

    static validate(authtoken: string): any[] {
        return !authtoken || !this.session[authtoken] ? [401, 'session is invalid'] : [200, this.session[authtoken]];
    }

    static async add(record: Record, authtoken: string): Promise<any[]> {
        if (authtoken && this.session[authtoken][0] !== 'admin') {
            return Promise.reject([403, 'operation requires special permission']);
        }

        var doc = await DB.findbyname(record.username);
        if (doc) return Promise.reject([500, 'user already exists']);

        var salt = this.random();
        var newrecord: Record = {
            username: record.username,
            password: this.hash(record.password, salt),
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

        await DB.add(newrecord);

        if (!authtoken) {
            var sessionid = this.random();
            this.session[sessionid] = ['user', record.username, record.loginip];
            return [200, sessionid];
        }

        return [200, ''];
    }

    static async remove(username: string, authtoken: string) {
        if (this.session[authtoken][0] !== 'admin') {
            return Promise.reject([403, 'operation requires special permission']);
        }

        if (this.session[authtoken][1] === username) {
            return Promise.reject([500, 'you cannot remove yourself']);
        }

        var doc = await DB.findbyname(username);
        if (!doc) return Promise.reject([401, 'user not found or password is incorrect']);

        await DB.remove(username);

        return [200, ''];        
    }

    static async getsingle(authtoken: string) {       
        var user = this.session[authtoken][1];

        var record = await DB.findbyname(user);
        if (!record) return Promise.reject([401, 'user not found or password is incorrect']);

        var record2 = _.omit(record, ['password', 'salt', '_id', '__v']);

        return [200, record2];
    }

    static async getall(authtoken: string) {
        if (this.session[authtoken][0] !== 'admin') {
            return Promise.reject([403, 'operation requires special permission']);
        }

        var docs = await DB.findall();
        if (!docs) return Promise.reject([500, 'no users found']);

        var res = <any>_.map(docs, (itm: any, key) => {
            itm = _.omit(itm, ['password', 'salt', '_id', '__v']);
            return itm;
        });

        return [200, res];
    }

    static async update(record: Record, authtoken: string) {
        if (this.session[authtoken][0] !== 'admin' && this.session[authtoken][1] !== record.username) {
            return Promise.reject([403, 'operation requires special permission']);
        }

        var doc = await DB.findbyname(record.username);
        if (!doc) return Promise.reject([401, 'user not found or password is incorrect']); 

        if (record.password) {
            var salt = this.random();
            doc.salt = salt;
            doc.password = this.hash(record.password, salt);
        }

        if (record.permissions && this.session[authtoken][0] === 'admin') doc.permissions = record.permissions;

        doc.email = record.email;
        doc.birthdate = record.birthdate;
        doc.updatedon = new Date().toISOString();

        await DB.update(doc);

        return [200, ''];
    }
}