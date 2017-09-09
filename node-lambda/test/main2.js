// import entire SDK
/*import aws = require('aws-sdk');
aws.config.update({
  accessKeyId: 'xxx',
  secretAccessKey: 'xxx'
});

var s3 = new aws.S3();
s3.listBuckets(function(err, data) {
  console.log(err, data);
});*/
// import AWS object without services
//import AWS = require('aws-sdk/global');
// import individual service
//import s3 = require('aws-sdk/clients/s3');

import { Authentication } from './routes/auth';
import { Profile } from './routes/profile';
import { Users } from './routes/users';

import { LambdaReq, LambdaReqError } from 'lambda-req'
import { Context, Callback, Handler, APIGatewayEvent } from 'aws-lambda';

function handler (event: APIGatewayEvent, context: Context, callback: Callback) {
  const lambda = new LambdaReq(event, context, callback)

  //lambda.proxy('', auth.validate)
  console.log([event, context])

  lambda.post('/api/login', Authentication.login)

  lambda.get('/api/profile', Profile.get)
  lambda.post('/api/profile', Profile.post)

  lambda.get('/api/users', Users.get)
  lambda.post('/api/users', Users.post)
  lambda.put('/api/users', Users.put)
  lambda.delete('/api/users', Users.delete)
  
  lambda.invoke()
}

export { handler }
