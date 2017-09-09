
import { Utils } from '../utils';
import _ = require("lodash");
import LambdaReq, { LambdaProxy, LambdaReqError } from 'lambda-req'

export class Users {
    static async get(locals:any, body:any):Promise<[number, any]> {
        try {
            var dbres = await Utils.getall(locals.authtoken);
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
        if (!body.username || !body.permissions || !body.birthdate || !body.email) {
            return [500, 'required parameters are empty']
        }

        if (body.username.length > 32 || body.permissions && body.permissions.length > 32 ||
            body.birthdate.length > 32 || body.email.length > 32 || body.password && body.password.length > 32) {
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

    static async put(locals:any, body:any):Promise<[number, any]> {
        if (!body.username || !body.permissions || !body.birthdate || !body.email) {
            return [500, 'required parameters are empty']
        }

        if (body.username.length > 32 || body.permissions && body.permissions.length > 32 ||
            body.birthdate.length > 32 || body.email.length > 32 || body.password && body.password.length > 32) {
            return [500, 'required parameters are too long']
        }

        try {
            var dbres = await Utils.add(body, locals.authtoken);
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

    static async delete(locals:any, body:any, params:any):Promise<[number, any]> {
        if (!params.username) {
            return [500, 'username is empty']
        }

        try {
            var dbres = await Utils.remove(params.username, locals.authtoken)
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