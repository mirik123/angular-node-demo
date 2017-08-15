import fs = require('fs');
import _ = require("lodash");

require('es6-promise').polyfill();
import mongoose = require('mongoose');

export interface IRecord {
    username: string;
    email: string;
    birthdate: string;
    permissions: string;  
    password: string;
    salt: string;  
    loginsuccesson?: Date;
    loginfailureon?: Date;
    failedlogins?: number;
    updatedon?: Date;
    createdon?: Date;    
    loginip?: string;      
}

interface IRecordModel extends IRecord, mongoose.Document { }
var schema = new mongoose.Schema({
    username: { type: String, unique: true, required: true, index: true },
    email: { type: String, required: true },
    birthdate: { type: String, required: true },
    permissions: { type: String, required: true },
    password: String,
    salt: String,
    loginsuccesson: Date,
    loginfailureon: Date,
    failedlogins: Number,
    updatedon: Date,
    createdon: Date,
    loginip: String
},{
    timestamps: true
}).pre('save', function (next) {
    this.updatedon = new Date();
    next();
});

export class DB {
    static records: mongoose.Model<IRecordModel> = null;

    static close() {
        mongoose.connection.close();
    }

    static init(): Promise<{}> {
        mongoose.Promise = <any>global.Promise;

        return new Promise<{}>((resolve, reject) => {
            if (mongoose.connection.readyState) {
                console.error('mongoose is already connected, readyState=', mongoose.connection.readyState);
                reject('already connected');
                return;
            }

            var options: mongoose.ConnectionOptions = {
                //user: 'admin',
                //pass: 'admin',
                //promiseLibrary: global.Promise,
                server: { socketOptions: { keepAlive: 120 } },
                replset: { socketOptions: { keepAlive: 120 } }
            };

            mongoose.connect('mongodb://'+process.env.DB_HOST+':'+process.env.DB_PORT+'/'+process.env.DB, options);        

            mongoose.connection.on('error', (msg) => {
                console.error('mongoose error: ', msg);
                reject(msg);
            });

            mongoose.connection.on('disconnected', () => {
                console.error('mongoose disconnected: ');
            });

            mongoose.connection.on('connected', () => {
                console.error('mongoose connected: ');
            });

            mongoose.connection.once('open', () => {
                DB.records = mongoose.model<IRecordModel>('IRecord', schema);

                resolve();
            });
        });
    }

    static findbyname(username: string): Promise<any> {
        return DB.records.findOne({ username: username }).lean().exec();
    }

    static add(record: IRecord): Promise<IRecordModel> {
        return new DB.records(record).save();
    }

    static remove(username: string): Promise<void> {
        return DB.records.remove({ username: username }).exec();
    }

    static removeall(): Promise<void> {
        return DB.records.remove({}).exec();
    }
    
    static findall(): Promise<any> {
        return DB.records.find({}).lean().exec();
    }

    static update(record: any): Promise<IRecord> {
        return DB.records.update({ username: record.username }, record).exec();
    }
}