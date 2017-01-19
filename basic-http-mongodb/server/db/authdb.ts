import fs = require('fs');
import _ = require("lodash");
import mongoose = require('mongoose');

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
    static records: mongoose.Model<mongoose.Document>;

    static init(): mongoose.Promise<{}> {
        var options: mongoose.ConnectionOptions = { user: 'admin', pass: 'admin', server: { socketOptions: { keepAlive: 120 } }, replset: { socketOptions: { keepAlive: 120 } } };
        mongoose.connect('mongodb://localhost/angular-node-demo', options);        
        var schema = new mongoose.Schema({
            username: { type: String, unique: true, required: true, index: true },
            email: { type: String, required: true },
            birthdate: { type: String, required: true },
            permissions: { type: String, required: true },
            password: { type: String, select: false, validate: (itm) => { return itm.length > 2; } },
            salt: { type: String, select: false },
            loginsuccesson: Date,
            loginfailureon: Date,
            failedlogins: Number,
            updatedon: Date,
            createdon: Date,
            loginip: String
        }, { timestamps: true });

        DB.records = mongoose.model('Record', schema);

        var promise = new mongoose.Promise();
        var connection = mongoose.connection;
        connection.on('error', (msg) => promise.reject(msg));
        connection.once('open', (result) => promise.resolve(result));

        return promise;
    }

    static save(): mongoose.Promise<mongoose.Document> {
        return DB.records.save().exec();
    }

    static findbyname(username: string): mongoose.Promise<mongoose.Document> {
        return DB.records.findOne({ username: username }).exec();
    }

    static add(record: Record): mongoose.Promise<mongoose.Document> {
        return DB.records.create(record);
    }

    static remove(username: string): mongoose.Promise<{}> {
        return DB.records.remove({ username: username }).exec();
    }

    static removeall(): mongoose.Promise<{}> {
        return DB.records.remove({}).exec();
    }
    
    static findall(): mongoose.Promise<mongoose.Document[]> {
        return DB.records.find({}).exec();
    }

    static update(record: any): mongoose.Promise<mongoose.Document> {
        return DB.records.findOneAndUpdate({ username: record.username }, record).exec();
    }
}