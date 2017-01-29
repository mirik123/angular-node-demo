import fs = require('fs');
import _ = require("lodash");
import crypto = require('crypto');
import { DB, Record } from './db/authdb';

export class Utils {
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
            DB.update({
                username: username,
                loginsuccesson: new Date().toISOString(),
                failedlogins: 0,
                loginip: ip
            });

            DB.save();

            return [true, record.permissions, username];
        }

        if (record) {
            DB.update({
                username: username,
                loginfailureon: new Date().toISOString(),
                failedlogins: (record.failedlogins || 0) + 1
            });

            DB.save();
        }

        return [false, 'user not found or password is incorrect'];
    }

    static add(record: Record): any[] {
        if (DB.findbyname(record.username)) return [false, 'user already exists'];        

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

        DB.add(newrecord);
        DB.save();

        return [true];
    }

    static remove(username: string): any[] {
        if (!DB.findbyname(username)) return [false, 'user not found or password is incorrect'];
        
        DB.remove(username);
        DB.save();

        return [true];
    }

    static getsingle(username): any[] {       
        var record = DB.findbyname(username);
        if (!record) return [false, 'user not found or password is incorrect'];

        var record2 = _.omit(record, ['password', 'salt']);
        return [true, record2];
    }

    static getall(): any[] {
        var res = _.map(DB.findall(), (itm: any, key) => {
            itm = _.omit(itm, ['password', 'salt']);
            return itm;
        });

        return [true, res];
    }

    static update(record: Record): any[] {
        var oldrecord = DB.findbyname(record.username);
        if (!oldrecord) return [false, 'user not found or password is incorrect'];

        if (record.password) {
            var salt = Utils.random();
            oldrecord.salt = salt;
            oldrecord.password = Utils.hash(record.password, salt);
        }

        if (record.permissions) oldrecord.permissions = record.permissions;

        oldrecord.email = record.email;
        oldrecord.birthdate = record.birthdate;
        oldrecord.updatedon = new Date().toISOString();

        DB.update(oldrecord);
        DB.save();

        return [true];
    }
}