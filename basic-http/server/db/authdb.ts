import fs = require('fs');
import _ = require("lodash");
import crypto = require('crypto');

class BaseRecord {
    loginsuccesson?: string;
    loginfailureon?: string;
    failedlogins?: number;
    updatedon?: string;
    createdon?: string;    
    loginip?: string;   
}

class Record extends BaseRecord {
    username: string;
    email: string;
    birthdate: string;
    permissions: string;  
    password: string;
}

export class DB {
    static records = require('./users.json');
    static session = {};

    static random() {
        return crypto.randomBytes(32).toString('hex');
    }

    static login(username: string, pass: string, ip:string) {
        var record = DB.records[username];
        if (record && record.password === pass) {
            var sessionid = DB.random();
            DB.session[sessionid] = [record.permissions, username, ip];

            record.loginsuccesson = new Date().toISOString();
            record.failedlogins = 0;
            record.loginip = ip;
            fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
                console.error('add', err);
            });

            return [true, sessionid];
        }

        if (record) {
            record.loginfailureon = new Date().toISOString();
            record.failedlogins = (record.failedlogins || 0) + 1;
            fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
                console.error('add', err);
            });
        }

        return [false, 'user not found or password is incorrect'];
    }

    static logout(authtoken: string):void {
        delete DB.session[authtoken];
    }

    static validate(authtoken: string) {
        return !authtoken || !DB.session[authtoken] ? [false, 'session is invalid'] : [true, DB.session[authtoken]];
    }

    static add(record:Record, authtoken: string) {
        if (DB.records[record.username]) return [false, 'user already exists'];
        if (authtoken && DB.session[authtoken][0] !== 'admin') return [false, 'operation requires special permission'];

        DB.records[record.username] = {
            username: record.username,
            password: record.password,
            permissions: record.permissions,
            email: record.email,
            birthdate: record.birthdate,
            createdon: new Date().toISOString(),
            updatedon: new Date().toISOString(),
            failedlogins: 0
        };

        if (!authtoken) {
            DB.records[record.username].loginsuccesson = new Date().toISOString();
            DB.records[record.username].loginip = record.loginip;
        }

        fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
            console.error('add', err);
        });

        if (!authtoken) {
            var sessionid = DB.random();
            DB.session[sessionid] = ['user', record.username, record.loginip];
            return [true, sessionid];
        }

        return [true, ''];
    }

    static remove(username: string, authtoken:string) {
        if (!DB.records[username]) return [false, 'user not found or password is incorrect'];
        if (DB.session[authtoken][0] !== 'admin') return [false, 'operation requires special permission'];
        if (DB.session[authtoken][1] === username) return [false, 'you cannot remove yourself'];

        delete DB.records[username];
        fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
            console.error('remove', err);
        });

        return [true, ''];
    }

    static getsingle(authtoken: string) {       
        var user = DB.session[authtoken][1];
        var record = DB.records[user];
        if (!record) return [false, 'user not found or password is incorrect'];

        record = _.omit(record, 'password');
        return [true, record];
    }

    static getall(authtoken: string) {
        if (DB.session[authtoken][0] !== 'admin') return [false, <any>'operation requires special permission'];

        var res = _.map(DB.records, (itm, key) => {
            itm = _.omit(itm, 'password');
            return itm;
        });

        return [true, res];
    }

    static update(record: Record, authtoken: string) {
        if (!DB.records[record.username]) return [false, 'user not found or password is incorrect'];
        if (DB.session[authtoken][0] !== 'admin' && DB.session[authtoken][1] !== record.username) return [false, 'operation requires special permission'];

        if (record.password) DB.records[record.username].password = record.password;
        if (record.permissions && DB.session[authtoken][0] === 'admin') DB.records[record.username].permissions = record.permissions;

        DB.records[record.username].email = record.email;
        DB.records[record.username].birthdate = record.birthdate;
        DB.records[record.username].updatedon = new Date().toISOString();

        fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
            console.error('update', err);
        });

        return [true, ''];
    }
}