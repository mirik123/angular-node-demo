
import express = require('express');
import https = require('https');
import http = require('http');
import path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
//var cookieParser = require('cookie-parser');
//var session = require('express-session');
var morgan = require('morgan');

var fs = require('fs');
import { Utils } from './utils';

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

	if (req.method === 'OPTIONS') {
		res.set('Access-Control-Request-Method', '*');
        res.set('Access-Control-Allow-Origin', req.headers['origin']);
        res.set('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.set('Access-Control-Allow-Headers', req.headers['origin']);
        res.set('Access-Control-Allow-Credentials', 'true');
		
        res.sendStatus(200);
		return;
	}

	next();
});

app.use(function (req: express.Request, res: express.Response, next) {
	if (req.url === '/' || req.url.indexOf('/api') !== 0) {
		res.end();
		return;
	}
		
	var auth = req.header('Authorization');
	if (!auth || auth.indexOf('Basic ') !== 0 && auth.indexOf('Bearer ') !== 0) {
        if (req.url !== '/api/logout') {
            res.status(401).json({ error: 'authorization required' });
        }
        else {
            res.sendStatus(200);
        }
	}
    else if (auth.indexOf('Basic ') === 0) {
		var encoded = auth.substring(6);
		var decoded = Buffer.from(encoded, 'base64').toString('utf8');
		var creds = decoded.split(':');

		req.body.username = creds[0];
        req.body.password = creds[1];
		next();
	}
	else {
		var authtoken = auth.substring(7);
		res.locals.authtoken = authtoken;
        var validate = Utils.validate(authtoken);
        if (!validate[0]) {
            if (req.url !== '/api/logout') {
                res.status(validate[1]).json({ error: 'authorization required' });
            }
            else {
                res.sendStatus(validate[1]);
            }
		}
		else {
			next();
		}
    }
});

app.use('/api/logout', function (req: express.Request, res: express.Response) {
    Utils.logout(res.locals.authtoken);
    res.sendStatus(200);
});

app.use('/api/login', require('./routes/login'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/users', require('./routes/users'));

http.createServer(app).listen(8080, function () {
    console.log('Express server listening on port 8080 and folder: ' + __dirname + '/../wwwroot/client');
    Utils.init();
    //Utils.seed(); //development only
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
https.createServer({
	key: fs.readFileSync(__dirname + '/sslcert/server.key'),
	cert: fs.readFileSync(__dirname + '/sslcert/server.crt'),
	ca: fs.readFileSync(__dirname + '/sslcert/ca.crt'),
	requestCert: true,
	rejectUnauthorized: false
}, app).listen(8443, function () {
    console.log("Secure Express server listening on port 8443");
    Utils.init();
    //Utils.seed(); //development only
});
