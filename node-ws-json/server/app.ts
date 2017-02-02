/// <reference path="../typings/index.d.ts" />


import express = require('express');
import https = require('https');
import http = require('http');
import path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
//var cookieParser = require('cookie-parser');
//var session = require('express-session');
var morgan = require('morgan');

var url = require('url');
import WebSocket = require("ws");

var fs = require('fs');

var app = express();

// all environments
//app.set('port', process.env.PORT || 3000);
app.use(favicon(__dirname + '/../wwwroot/client/assets/icons/favicon.ico'));
app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/../wwwroot/client'));
//app.use(cookieParser());
/*app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));*/

// development only
app.use(function (err, req: express.Request, res: express.Response, next) {
	console.error(err.stack);
	res.status(500).json({ error: 'unknown error' });
	res.end();
});

app.use(function (req: express.Request, res: express.Response, next) {
    console.log(req.method + ' ' + req.url);
	next();
});

var httpsrv = http.createServer(app);
var wsServer = new WebSocket.Server({ server: httpsrv });
wsServer.on("connection", client => evtWebSockedConnected(wsServer, client)).on('error', function (err: Error) {
    console.error('WebSocket error', err);
});

httpsrv.listen(8080, function () {
    console.log('Express server listening on port 8080 and folder: ' + __dirname + '/../wwwroot/client');
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
    key: fs.readFileSync(__dirname + '/sslcert/server.key'),
    cert: fs.readFileSync(__dirname + '/sslcert/server.crt'),
    ca: fs.readFileSync(__dirname + '/sslcert/ca.crt'),
    requestCert: true,
    rejectUnauthorized: false
}, app);
httpssrv.listen(8443, function () {
    console.log("Secure Express server listening on port 8443");
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

        if (data.target !== 'login' && data.target !== 'logout' && !client['session']) {
            client.send(JSON.stringify({ target: data.target, error: 'session is invalid, login first' }), err => { if (err) console.error('send error: ', err); });
            return;
        }

        var result = message(data, ip, client);
        result.target = data.target;
        result.content = result.content || {};

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