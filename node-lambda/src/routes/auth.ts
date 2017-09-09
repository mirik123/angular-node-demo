
import { Utils } from '../utils';
import _ = require("lodash");

import { APIGatewayEvent  } from 'aws-lambda';

export class Authentication {
    static async login(locals:any, body:any):Promise<[number, any]> {
        if (!locals.username || !locals.password) {
            return [500, 'user or password are empty']
        }

        if (locals.username.length > 32 || locals.password.length > 32) {
            return [500, 'user or password are too long']
        }

        try {
            var dbres = await Utils.login(locals.username, locals.password, locals.ip);
            var validate = Utils.validate(dbres[1]);
            if (validate[0] !== 200) {
                return [validate[0], validate[1]]
            }
            else {
                return [200, {authtoken: dbres[1], permissions: validate[1][0]}];
            }
        }
        catch (err) {
            if (_.isArray(err) && err.length === 2) {
                return [<number>err[0], err[1]]
            }
            else {
                return [500, 'server error']
            }
        }
    }

    static async middleware(req:APIGatewayEvent):Promise<[number, any]> {  
        var auth = req.headers['Authorization'];
        var body = req.headers['Content-Type'] === 'application/json' && req.body && JSON.parse(req.body) || req.body;
        var ip = '???';

        if (!auth || auth.indexOf('Basic ') < 0 && auth.indexOf('Bearer ') < 0) {
            if (req.resource !== '/logout') {
                return [401, 'authorization required']
            }
            else {
                return [200, null];
            }
        }
        else if (auth.indexOf('Basic ') === 0) {
            var encoded = auth.substring(6);
            var decoded = Buffer.from(encoded, 'base64').toString('utf8');
            var creds = decoded.split(':');

            try {
                await Utils.init();
            }
            catch(ex) {
                console.error('failed to init db', ex);
                return [500, ex.message]
            }

            return [null, {
                locals: {username: creds[0], password: creds[1], ip:ip}
            }];
        }
        else {
            var authtoken = auth.substring(7);
            var validate = Utils.validate(authtoken);
            if (validate[0] !== 200) {
                if (req.resource !== '/logout') {
                    return [401, 'authorization required']
                }
                else {
                    Utils.logout(authtoken);
                    return [200, null];
                }
            }
            else {
                return [null, {
                    body: body,
                    locals: {authtoken: authtoken, ip:ip}
                }];
            }
        }
    }
}
