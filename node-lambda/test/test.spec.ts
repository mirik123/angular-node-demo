
var fs = require('fs');

//import jasmine from 'jasmine'
import { handler } from '../src/main';

describe('lambda local test', () => {
    var authtoken;

    it('login', done => {
        var evt_login = {
            headers: {
                'Authorization': 'Basic ' + Buffer.from('admin:111', 'utf8').toString('base64'),
                'Content-Type': 'application/json'
            },
            httpMethod: 'POST',
            resource: '/login',
            body: '{}'
            //pathParameters: {username:'admin'}
        };

        handler(<any>evt_login, null, (err, data) => {
            console.log('res: ', [err, data]);

            authtoken = data && data.authtoken

            if(!err) 
                done()
            else
                done.fail(err)
        })
    })

    it('get profile', done => {
        var evt_profile = {
            headers: {
                'Authorization': 'Bearer ' + authtoken,
                'Content-Type': 'application/json'
            },
            httpMethod: 'GET',
            resource: '/profile',
            body: '{}'
        };
        
        handler(<any>evt_profile, null, (err, data) => {
            console.log('res: ', [err, data]);
        
            if(!err) 
                done()
            else
                done.fail(err)
        });
    })
})