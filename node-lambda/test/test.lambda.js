import AWS from 'aws-sdk'

const config = {
  FunctionName: 'main.js',
  Payload: JSON.stringify({ command: 'handler', params: { name: 'users' } })
}
const lambda = new AWS.Lambda()
lambda.invoke(config).promise().then(response => JSON.parse(<string>response.Payload))
