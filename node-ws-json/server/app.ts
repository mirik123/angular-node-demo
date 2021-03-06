﻿/// <reference path="../typings/index.d.ts" />


import express = require('express');
import https = require('https');
import http = require('http');
import path = require('path');
import bodyParser = require('body-parser');
import favicon = require('serve-favicon');
//import cookieParser = require('cookie-parser');
import session = require('express-session');
import morgan = require('morgan');

import url = require('url');
import WebSocket = require("ws");

//import RedisStore = require('connect-redis');

var fs = require('fs');

var app = express();

if(process.env.BASE_DIR) process.chdir(process.env.BASE_DIR);
const client_path = process.env.PROJ_LOCAL_CLIENT;
const http_port = process.env.PROJ_PORT;

// all environments
//app.set('port', process.env.PORT || 3000);
if(client_path) app.use(favicon(client_path + '/assets/icons/favicon.ico'));
app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
if(client_path) app.use(express.static(client_path));
//app.use(cookieParser());

var sessionReq = session({
    secret: '123456',
    resave: false,
    saveUninitialized: true,
    //store: new RedisStore({}),
    cookie: { maxAge: 3600000, secure: 'auto' }
});
app.use(sessionReq);

// development only
app.use(function (err, req: express.Request, res: express.Response, next) {
	console.error(err.stack);
	res.status(500).json({ error: 'unknown error' });
	res.end();
});

app.use(function (req: express.Request, res: express.Response, next) {
    console.log(req.method + ' ' + req.url);

	res.set('Access-Control-Request-Method', '*');
	res.set('Access-Control-Allow-Origin', req.headers['origin']);
	res.set('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Sec-Websocket-Protocol');
	res.set('Access-Control-Allow-Credentials', 'true');
	
	if (req.method === 'OPTIONS') {
	  res.sendStatus(200);
	  return;
	}

    if (req.url === '/api') {
        res.sendStatus(200);
		return;
    }

    next();
});

var httpsrv = http.createServer(app);
var wsServer = new WebSocket.Server({
    server: httpsrv,
    path: '/ws',
    verifyClient: function (info: { origin: string; secure: boolean; req: http.IncomingMessage }, next) {
        sessionReq(<express.Request>info.req, <express.Response>{}, function () {
            var session = info.req['session'];
            console.info('Session info', session);
            //next(session && session.id && info.req.headers.cookie);

            /*if (session) //check session
            {
                info.req.headers["set-cookie"] = session.SessionID; 
            }
            else {
                //authenticate here
            }*/

            next(true);
        });   
    }
});

wsServer.on("connection", client => evtWebSockedConnected(wsServer, client)).on('error', function (err: Error) {
    console.error('WebSocket error', err);
});
/*wsServer.on('headers', headers => {
    headers.push('Set-Cookie: connect.sid=1');
});*/

httpsrv.listen(http_port, function () {
    console.log('Express server listening on port ' + http_port);
});

//https://matoski.com/article/node-express-generate-ssl/
//openssl genrsa -des3 -out ca.key 1024
//openssl req -new -key ca.key -out ca.csr
//openssl x509 -req -days 365 -in ca.csr -out ca.crt -signkey ca.key
//openssl genrsa -des3 -out server.key 1024
//openssl req -new -key server.key -out server.csr
//cp server.key server.key.passphrase
//openssl rsa -in server.key.passphrase -out server.key
//openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
/*var httpssrv = https.createServer({
	key: fs.readFileSync('./sslcert/server.key'),
	cert: fs.readFileSync('./sslcert/server.crt'),
	ca: fs.readFileSync('./sslcert/ca.crt'),
    requestCert: true,
    rejectUnauthorized: false
}, app);
httpssrv.listen(https_port, function () {
    console.log("Secure Express server listening on port "+https_port);
});

wsServer = new WebSocket.Server({
    server: httpssrv
    //path: '/ws'
    //,verifyClient: function (info, next) {
    //    var token = info.req.headers['sec-websocket-protocol']; //info.req.headers.cookie['access_token']?
    //    next(true);
    //}
});
wsServer.on("connection", evtWebSockedConnected.bind(wsServer)).on('error', function (err: Error) {
    console.error('WebSocket error', err);
});*/

import { Utils } from './utils';
import { message } from './message';

function evtWebSockedConnected(server: WebSocket.Server, client: WebSocket): void {
    function broadcast(data: string): void {
        server.clients.forEach(client => {
            client.send(data);
        });
    };

    if (!client) return;
    var ip = client.upgradeReq.socket.remoteAddress;
    var location = url.parse(client.upgradeReq.url, true);
    var session: Express.Session;

    sessionReq(<express.Request>client.upgradeReq, <express.Response>{}, function () {
        session = client.upgradeReq['session'];
    });

    // you might use location.query.access_token to authenticate or share sessions
    // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)   
    //http://stackoverflow.com/questions/36842159/node-js-ws-and-express-session-how-to-get-session-object-from-ws-upgradereq

    console.info("websocket connection open");

    Utils.init();
    //Utils.seed();

    client.on("message", data => {
        if (!data) {
            client.send(JSON.stringify({ error: 'message is empty' }), err => { if (err) console.error('send error: ', err); });
            return;
        }

        try {
            data = JSON.parse(data);
        }
        catch (err) {
            console.error('message error: ', err)
            client.send(JSON.stringify({ error: 'message is invalid' }), err => { if (err) console.error('send error: ', err); });
            return;
        }

        if (!data.target || !data.content) {
            client.send(JSON.stringify({ error: 'message target or content are empty' }), err => { if (err) console.error('send error: ', err); });
            return;
        }

        if (data.target !== 'login' && data.target !== 'logout' && !session['username']) {
            client.send(JSON.stringify({ target: data.target, error: 'session is invalid, login first' }), err => { if (err) console.error('send error: ', err); });
            return;
        }

        var result: any;
        if (data.target === 'logout') {
            result = { content: {}, target: 'logout' };
            session.destroy(err => { if (err) console.error('destroy session error: ', err); });
            //client.close(3001, { message: 'planned closure' });
        }
        else {
            result = message(data, ip, session);
            result.target = data.target;
            result.content = result.content || {}; 

            session.save(err => { if (err) console.error('save session error: ', err); });
        }

        client.send(JSON.stringify(result), err => { if (err) console.error('send error: ', err); });
    });

    client.on('open', function () {
        console.log('WebSocket connection opened');
    });

    client.on("close", function (code, message) {
        console.log("websocket connection close", [code, message]);
    });

    client.on('error', function (err: Error) {
        console.error('WebSocket send error', err);
    });
};