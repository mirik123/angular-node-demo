
import express = require('express');
import https = require('https');
import http = require('http');
import path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var morgan = require('morgan');

var fs = require('fs');
var privateKey = fs.readFileSync(__dirname + 'sslcert/server.key');
var certificate = fs.readFileSync(__dirname + 'sslcert/server.crt');

import DB = require('./db/authdb');

var app = express();

// all environments
//app.set('port', process.env.PORT || 3000);
app.use(favicon(__dirname + '/../wwwroot/assets/icons/favicon.ico'));
app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/../wwwroot'));

// development only
/*app.use(function (err, req: express.Request, res: express.Response, next) {
	console.error(err.stack);
});*/

app.use(function (req: express.Request, res: express.Response, next) {
	if (req.method === 'OPTIONS') {
		res.setHeader('Access-Control-Request-Method', '*');
		res.setHeader('Access-Control-Allow-Origin', req.headers['origin']);
		res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', req.headers['origin']);
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		
		res.writeHead(200);
		res.end();
		return;
	}
});

app.use(function (req: express.Request, res: express.Response, next) {
	console.log(req.url);

	if (req.url === '/') {
		res.end();
		return;
	}
	if (req.url.indexOf('/api') !== 0) return;
		
	var auth = req.header('Authorization');
	if (!auth || auth.indexOf('Basic ') !== 0 && auth.indexOf('Bearer ') !== 0) {
		next(new Error('authorization required'));
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
		var validate = DB.DB.validate(authtoken);
		if (!validate[0]) {
			next(new Error('authorization required'));
		}
		else {
			res.locals.session = validate[1];
			next();
		}
	}
});

app.use('/api/logout', function (req: express.Request, res: express.Response) {
	DB.DB.logout(res.locals.authtoken);
});
app.use('/api/login', require('./routes/login'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/users', require('./routes/users'));

/*app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port') + ' and folder: ' + __dirname + '/../wwwroot');
});*/

http.createServer(app).listen(80, function () {
	console.log('Express server listening on port 80 and folder: ' + __dirname + '/../wwwroot');
});

https.createServer({ key: privateKey, cert: certificate }, app).listen(443, function () {
	console.log('Express server listening on port 443 and folder: ' + __dirname + '/../wwwroot');
});

