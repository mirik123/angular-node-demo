'use strict';

import { Context, Callback, Handler, APIGatewayEvent } from 'aws-lambda';

import { Authentication } from './routes/auth';
import { Profile } from './routes/profile';
import { Users } from './routes/users';

let routes = {
    'middleware': Authentication.middleware,
    'POST_/login': Authentication.login,
    'GET_/profile': Profile.get,
    'POST_/profile': Profile.post,
    'GET_/users': Users.get,
    'PUT_/users': Users.put,
    'POST_/users': Users.post,
    'DELETE_/users': Users.delete
}

let handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
    if(context) context.callbackWaitsForEmptyEventLoop = false;

    let done = (status:number, data) => {
        callback(null, {
            isBase64Encoded: false,
            statusCode: status,
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: data && (typeof data !== 'string') && JSON.stringify(data) || data
        })
    }

    //console.log('Received event:', JSON.stringify(event, null, 2));

    let locals, 
        body = event.body, 
        query = event.queryStringParameters, 
        params = event.pathParameters, 
        headers = event.headers;

    new Promise((resolve, reject) => {
        if(routes.middleware) {
            routes.middleware(event).then(response => {
                if(response[0]) {
                    resolve(response)
                }
                else {
                    locals = response[1].locals
                    body = response[1].body

                    resolve()
                }
            }, err => {
                reject(err)
            })
        }
        else {
            if(event.body && headers['Content-Type'] === 'application/json')
                body = event.body && JSON.parse(event.body)

            resolve()
        }
    }).then(data => {
        if(data)
            return done(data[0], data[1])

        let routeHandle = routes[event.httpMethod+'_'+event.resource]
        if(routeHandle) {
            routeHandle(locals, body, params, query, headers).then(response => {
                done(response[0], response[1])
            }, err => {
                callback(err)
            })
        }
        else {
            done(400, 'Unsupported method: '+event.httpMethod+', '+event.resource)
        }
    }, err => {
        callback(err)
    })
};

export { handler }

//exports.handler = handler;
