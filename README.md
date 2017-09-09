# Proof-of-Concept projects for MEAN stack

[![Build Status](https://travis-ci.org/mirik123/angular-node-demo.svg?branch=master)](https://travis-ci.org/mirik123/angular-node-demo)

|Project name|Project description|
|---|---|
|[basic-http-project](https://github.com/mirik123/angular-node-demo/tree/master/basic-http-client)|AngularJS 1.6 frontend project. <br/>Using: $cookies, $http, $rootScope.$emit, Basic/Bearer header authentication, gulp/tsify/browserify.|
|[](https://github.com/mirik123/angular-node-demo/tree/master/basic-ws-client)|AngularJS 1.6 frontend project. <br/>Using: $rootScope.$emit, dummy $http request for opening "Express.Session" and WebSockets for other regular operations. <br/>Applicative authentication by WebSocket login request.|
|[basic-ws-rx-client](https://github.com/mirik123/angular-node-demo/tree/master/basic-ws-rx-client)|AngularJS 1.6 frontend project. <br/>The same as the previous project but implements events with Observable instead of the $rootScope.$emit.|
|[ng2-http-client](https://github.com/mirik123/angular-node-demo/tree/master/ng2-http-client)|AngularJS 2.0 frontend project. <br/>Using: $http, Observable, ng2-cookies, router. <br/>*Not completed yet, missing analogues code for NG-MESSAGE and MD-DATA-TABLE.*|
|[node-http-json](https://github.com/mirik123/angular-node-demo/tree/master/node-http-json)|NodeJS backend project. <br/>Using: TypeScript to ES5, gulp/tsify/no browserify, JSON file for authentication repository.|
|[node-http-mongodb-es5](https://github.com/mirik123/angular-node-demo/tree/master/node-http-mongodb-es5)|NodeJS backend project. <br/>Using: TypeScript to ES5, gulp, MongoDB with callbacks for authentication repository.|
|<nobr>[node-http-mongodb-es6](https://github.com/mirik123/angular-node-demo/tree/master/node-http-mongodb-es6)</nobr>|NodeJS backend project. <br/>Using: TypeScript to ES6, gulp, MongoDB with async/await for authentication repository.|
|[node-ws-json](https://github.com/mirik123/angular-node-demo/tree/master/node-ws-json)|NodeJS backend project for WebSocket clients. <br/>Using: TypeScript to ES5, gulp, WS, Express.Session|
|[node-lambda](https://github.com/mirik123/angular-node-demo/tree/master/node-lambda)|AWS Lambda project. Using: TypeScript to ES6, async/await, gulp with tsify and partial broserify except mongoose, ts-jasmine for unitests. The session is valid for 5 min becuse of the Lambda container reuse policy.|

# General
All frontend projects are SPA applications that use Angular 1.6/2.0 with TypeScript and Responsive Material Design.
The backend projects use Node with TypeScript on a server side.
The projects are built with gulp, they supports 2 options for a development and a production environments (minimized and uglyfied).

# REST API
The communication with a server side conducted by either HTTP REST or WebSockets.
As a first stage the user sends username and password and receives the server's generated authentication token.
Servers are statefull and keep sessions with authenticaiton tokens for every logged user and validate authentication tokens at every user request.

  |Component          |Method|Request URL|Request Header           |Request Body|Response |Description|
  |-------------------|------|-----------|-------------------------|------------|-------- |-----------|
  |login              |POST  |/login     |Basic “username:password”|            |authtoken|Login and receive authentication token|
  |logout             |POST  |/logout    |Bearer “authtoken”       |            |         |Logout user and kill server session|
  |user profile       |GET   |/profile   |Bearer “authtoken”       |            |"username":"user", "permissions":"user", "email":"user22@com", "birthdate":"2016-12-31T22:00:00Z", "createdon":"2017-01-13T15:21:41.599Z", "updatedon":"2017-01-15T20:42:45.192Z", "failedlogins":3, "loginsuccesson":"2017-01-13T15:31:21.239Z", "loginip":"::1", "loginfailureon":"2017-01-22T11:19:26.061Z"|Get currently logged user profile data|
  |                   |POST  |/profile   |Bearer “authtoken”       |password, permissions, birthdate, email| |Update current user profile data                                                                  
  |user management    |GET   |/users     |Bearer “authtoken”       | |[array of user profiles]|Get all user profiles (admins only).|
  |                   |POST  |/users     |Bearer “authtoken”       |password, permissions, birthdate, email||Update other user profiles, one at a time (admins only)|                                                         
  |                   |PUT   |/users     |Bearer “authtoken”       |username, password, permissions, birthdate, email||Create new user (admins only)|                                                                
  |                   |DELETE|/users/id  |Bearer “authtoken”       | | |Delete user (admins only)|                                                           

# Authentication
Projects can use either secured or unsecured connections, passwords are sent in a clear text to the server and stored as a PBKDF2 hashed and salted strings.
The authentication token is kept in cookie and is persistive over browser page reloads.

To do login a user passes its credentials in an Authorization header as a hashed and base64 encoded string (Basic authentication).
Server decrypts Authorization header, creates authentication token and adds it to the session dictionary together with the user name, the user permission level and the user IP address.
User passes its authentication token **at every http request** in an Authorization header as a Bearer token.
Server validates the existence of that authenticaiton token and compares the current request IP address to the recorded IP address to ensure that it is the same address that existed at user logon.
Authentication module runs as Node.js middleware before any other application modules, and only when it successfully validates request it allows for the routing to go on.
Administrators can manage othe users' accounts including changing their passwords.
Only administrator can rise other user's account permission level from simple user to manager or administrator.

Authentication repository also holds an additional user logon information:
-   account creation time
-   last account update time
-   last successful login time
-   last failed login time
-   number of failed logon attempts.
-   last login IP address.
