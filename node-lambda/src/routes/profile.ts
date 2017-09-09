
import { Utils } from '../utils';
import _ = require("lodash");

export class Profile {
    static async get(locals:any, body:any):Promise<[number, any]> {
        try {
            var dbres = await Utils.getsingle(locals.authtoken);
            return [200, dbres[1]]
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

    static async post(locals:any, body:any):Promise<[number, any]> {
        body.permissions = '';

        if (!body.username || !body.birthdate || !body.email) {
            return [500, 'required parameters are empty']
        }

        if (body.username.length > 32 || body.birthdate.length > 32 || body.email.length > 32 || body.password && body.password.length > 32) {
            return [500, 'required parameters are too long']
        }

        try {
            var dbres = await Utils.update(body, locals.authtoken);
            return [200, null]    
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
}