const lambdaLocal = require('lambda-local'),
        path = require('path'),
        sinon = require('sinon');

lambdaLocal.setLogger(your_winston_logger);

var jsonPayload = {
    'key': 1,
    'another_key': "Some text"
}

lambdaLocal.execute({
    event: jsonPayload,
    lambdaPath: path.join(__dirname, 'main'),
    profilePath: '~/.aws/credentials',
    profileName: 'default',
    timeoutMs: 3000,
    callback: function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    }
});

var done, err;
before(function (cb) {
    var lambdaFunc = require("../src/main");
    //For instance, this will replace the getData content
    sinon.mock(lambdaFunc).expects("getData").returns("MockedData"); 

    //see on sinonjs page for more options
    lambdaLocal.execute({
        event: jsonPayload,
        lambdaFunc: lambdaFunc, //We are directly passing the lambda function
        lambdaHandler: "handler",
        callbackWaitsForEmptyEventLoop: true,
        timeoutMs: 3000,
        callback: function (_err, _done) { //We are storing the results and finishing the before() call => one lambda local call for multiple tests
            err = _err;
            done = _done;
            cb();
        },
        verboseLevel: 1 //only prints a JSON of the final result
    });
});

describe("Your first test", function () {
    it("should return mocked value", function () {
        expect(done).eq("MockedData");
    });
});