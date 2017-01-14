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
    salt: string;      
}

export class DB {
    static records: { [id: string]: Record; };
    static session = {};

    static init() {
        DB.records = {};

        fs.readFile(__dirname + '/users.json', 'utf8', (err: NodeJS.ErrnoException, data: string) => {
            DB.records = JSON.parse(data);
        });
    }

    static hash(password: string, salt: string) {
        return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha1').toString('hex');
    }

    static random() {
        return crypto.randomBytes(32).toString('hex');
    }

    static seed() {
        DB.records = {};

        var salt = DB.random();
        DB.records['admin'] = {
            username: 'admin',
            email: 'admin@com',
            birthdate: new Date().toISOString(),
            permissions: 'admin',
            salt: salt,
            password: DB.hash('123', salt)
        };

        salt = DB.random();
        DB.records['user'] = {
            username: 'user',
            email: 'user@com',
            birthdate: new Date().toISOString(),
            permissions: 'user',
            salt: salt,
            password: DB.hash('123', salt)
        };

        fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
            console.error('add', err);
        });
    }

    static login(username: string, pass: string, ip: string): any[] {
        var record = DB.records[username];
        if (record && record.password === DB.hash(pass, record.salt)) {
            var sessionid = DB.random();
            DB.session[sessionid] = [record.permissions, username, ip];

            record.loginsuccesson = new Date().toISOString();
            record.failedlogins = 0;
            record.loginip = ip;
            fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
                console.error('add', err);
            });

            return [true, 200, sessionid];
        }

        if (record) {
            record.loginfailureon = new Date().toISOString();
            record.failedlogins = (record.failedlogins || 0) + 1;
            fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
                console.error('add', err);
            });
        }

        return [false, 401, 'user not found or password is incorrect'];
    }

    static logout(authtoken: string):void {
        delete DB.session[authtoken];
    }

    static validate(authtoken: string): any[] {
        return !authtoken || !DB.session[authtoken] ? [false, 401, 'session is invalid'] : [true, 200, DB.session[authtoken]];
    }

    static add(record: Record, authtoken: string): any[] {
        if (DB.records[record.username]) return [false, 500, 'user already exists'];
        if (authtoken && DB.session[authtoken][0] !== 'admin') return [false, 403, 'operation requires special permission'];

        var salt = DB.random();
        DB.records[record.username] = {
            username: record.username,
            password: DB.hash(record.password, salt),
            salt: salt,
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
            return [true, 200, sessionid];
        }

        return [true, 200, ''];
    }

    static remove(username: string, authtoken: string): any[] {
        if (!DB.records[username]) return [false, 401, 'user not found or password is incorrect'];
        if (DB.session[authtoken][0] !== 'admin') return [false, 403, 'operation requires special permission'];
        if (DB.session[authtoken][1] === username) return [false, 500, 'you cannot remove yourself'];

        delete DB.records[username];
        fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
            console.error('remove', err);
        });

        return [true, 200, ''];
    }

    static getsingle(authtoken: string): any[] {       
        var user = DB.session[authtoken][1];
        var record = DB.records[user];
        if (!record) return [false, 401, 'user not found or password is incorrect'];

        var record2 = _.omit(record, ['password', 'salt']);
        return [true, 200, record2];
    }

    static getall(authtoken: string): any[] {
        if (DB.session[authtoken][0] !== 'admin') return [false, 403, <any>'operation requires special permission'];

        var res = _.map(DB.records, (itm:any, key) => {
            itm = _.omit(itm, ['password', 'salt']);
            return itm;
        });

        return [true, 200, res];
    }

    static update(record: Record, authtoken: string): any[] {
        if (!DB.records[record.username]) return [false, 401, 'user not found or password is incorrect'];
        if (DB.session[authtoken][0] !== 'admin' && DB.session[authtoken][1] !== record.username) return [false, 403, 'operation requires special permission'];

        if (record.password) {
            var salt = DB.random();
            DB.records[record.username].salt = salt;
            DB.records[record.username].password = DB.hash(record.password, salt);
        }

        if (record.permissions && DB.session[authtoken][0] === 'admin') DB.records[record.username].permissions = record.permissions;

        DB.records[record.username].email = record.email;
        DB.records[record.username].birthdate = record.birthdate;
        DB.records[record.username].updatedon = new Date().toISOString();

        fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
            console.error('update', err);
        });

        return [true, 200, ''];
    }
}