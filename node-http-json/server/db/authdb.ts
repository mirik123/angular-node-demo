import fs = require('fs');
import _ = require("lodash");

class BaseRecord {
    loginsuccesson?: string;
    loginfailureon?: string;
    failedlogins?: number;
    updatedon?: string;
    createdon?: string;    
    loginip?: string;   
}

export class Record extends BaseRecord {
    username: string;
    email: string;
    birthdate: string;
    permissions: string;  
    password: string;
    salt: string;      
}

export class DB {
    static records: { [id: string]: Record; };

    static init() {
        DB.records = {};

        fs.readFile(__dirname + '/users.json', 'utf8', (err: NodeJS.ErrnoException, data: string) => {
            DB.records = JSON.parse(data);
        });
    }

    static save() {
        fs.writeFile(__dirname + '/users.json', JSON.stringify(DB.records, null, 3), (err: NodeJS.ErrnoException) => {
            console.error('add', err);
        });
    }

    static findbyname(username: string): Record {
        return _.cloneDeep(DB.records[username]);
    }

    static add(record: Record) {
        DB.records[record.username] = record;
    }

    static remove(username: string) {
        delete DB.records[username];
    }

    static removeall() {
        DB.records = {};
    }
    
    static findall(): any {
        return DB.records;
    }

    static update(record: any) {
        var itm = DB.records[record.username];
        if (itm) {
            _.merge(itm, record);
        }
    }
}