import fs = require('fs');
import _ = require("lodash");

require('es6-promise').polyfill();
import mongoose = require('mongoose');
//import { Promise } from 'es6-promise';

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
    static records: mongoose.Model<mongoose.Document> = null;

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
                //promiseLibrary: require('bluebird'),
                server: { socketOptions: { keepAlive: 120 } },
                replset: { socketOptions: { keepAlive: 120 } }
            };

            mongoose.connect('mongodb://localhost:27017/local', options);        

            mongoose.connection.on('error', (msg) => {
                console.error('mongoose error: ', msg);
                reject(msg);
            });

            mongoose.connection.on('disconnected', (args) => {
                console.error('mongoose disconnected: ', args);
            });

            mongoose.connection.on('connected', (args) => {
                console.error('mongoose connected: ', args);
            });

            mongoose.connection.once('open', () => {
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
                },
                {
                    timestamps: true
                });

                DB.records = mongoose.model('Record', schema);

                resolve();
            });
        });
    }

    static findbyname(username: string): Promise<Record> {
        return DB.records.findOne({ username: username }).lean().exec();
    }

    static add(record: Record): Promise<mongoose.Document> {
        return new DB.records(record).save();
    }

    static remove(username: string): Promise<void> {
        return DB.records.remove({ username: username }).exec();
    }

    static removeall(): Promise<void> {
        return DB.records.remove({}).exec();
    }
    
    static findall(): Promise<Record[]> {
        return DB.records.find({}).lean().exec();
    }

    static update(record: any): Promise<any> {
        return DB.records.update({ username: record.username }, record).exec();
    }
}