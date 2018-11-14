var request = require('request');
var Promise = require('bluebird');
var Joi = require('joi');
const async = require('async');
var emailExistence = require("email-existence");
var fs = require('fs');
const util = require('util');
const setImmediatePromise = util.promisify(setImmediate);


var response = require('./responses');
var commonFunction = require('./commonFunction');
var moment = require('moment');

exports.signUp = signUp;
exports.signupWaterfall = signupWaterfall;
exports.checkEmailExistence = checkEmailExistence;
exports.exampleAuto = exampleAuto;
exports.examples = examples;
exports.signupAwait = signupAwait;
exports.promiseToCb = promiseToCb;
exports.timerExample = timerExample;
exports.setImEx = setImEx;

function signUp(req, res) {
    console.log("req.body------>", req.body);
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    var validateReq = Joi.validate({ name, email, password }, schema);
    console.log("validateReq----->", validateReq);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }

    Promise.coroutine(function* () {
        var insertObj = {
            name: name,
            email: email,
            password: password,
        }
        console.log("insertObj-------->", insertObj);
        var insert = yield commonFunction.insertIntoTable("users", insertObj);
        console.log("insert-------->", insert);
        if (insert.affectedRows == 1) {
            return "Data successfully inserted";
        }
    })().then(result => {
        return response.actionCompleteResponse(res, result);
    }).catch(error => {
        console.log("error", error);
        return response.sendActionFailedResponse(res, [], error.message, error.status_code);
    });
}

function signupWaterfall(req, res) {
    console.log("new signup");
    console.log("req.body------>", req.body);
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    var validateReq = Joi.validate({ name, email, password }, schema);
    console.log("validateReq----->", validateReq);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    async.waterfall([

        function (callback) {
            connection.query('SELECT email from users where email= ?', [email], function (err, result) {
                if (err) throw err;

                callback(null, result);
            })
        },
        function (result, callback) {
            if (result.length != 0) {
                console.log("Email already exits...")
                return response.actionCompleteResponse(res, "Email already exits...");
            }
            else {
                callback(null);
            }
        },

        function (callback) {
            var insert = `INSERT into users (name, email, password) values(
    "${name}",
    "${email}",
    "${password}")`;

            connection.query(insert, function (err, cb) {
                if (err) throw err;
                callback(null, cb);
            });
        }
    ],
        function (err, result) {
            if (err) {
                console.log("error", err);
                return response.sendActionFailedResponse(res, [], err);
            }
            if (result.affectedRows == 1) {
                return response.actionCompleteResponse(res, "Data inserted successfully");
            }
        })
}

function exampleAuto(req, res) {
    var name = req.body.name;
    async.auto({

        getData1(cb) {
            let data = "hello!!" + name;
            return cb(null, data);
        },

        getData2(cb) {

            let data = "How are you?" + name;
            return cb(null, data);
        },

        getData: ['getData1', 'getData2', function (dataToBeUsed, cb) {
            console.log("getData1 result>>", dataToBeUsed.getData1)
            console.log("getData2 result>>", dataToBeUsed.getData2);
            return response.actionCompleteResponse(res, dataToBeUsed);
        }]
    });
}


function checkEmail(email, callback) {
    console.log("email", email);
    emailExistence.check(email, function (error, response) {
        if (error) {
            console.log(error);
        }
        console.log('res: ' + response);
        return callback(null, response);
    });
};

function checkEmailExistence(req, res) {
    console.log("req.body------>", req.body);
    var email = req.body.email;

    var schema = Joi.object().keys({
        email: Joi.string().required()
    });

    var validateReq = Joi.validate({ email }, schema);
    console.log("validateReq----->", validateReq);
    return new Promise((resolve, reject) => {
        Promise.coroutine(function* () {
            var emailExistenceCheck = Promise.promisify(checkEmail);
            var CheckEmailExistence = yield emailExistenceCheck(email);
            console.log("CheckEmailExistence------->>", CheckEmailExistence);
            if (CheckEmailExistence == true) {
                return "Email exists";
            } else {
                return "Email does not exists";
            }

        })().then(result => {
            return response.actionCompleteResponse(res, result);
        }).catch(error => {
            console.log("error", error);
            return response.sendActionFailedResponse(res, error.message);
        });
    });
}

function examples(req, res) {
    console.log("req.body------>", req.body);
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    var validateReq = Joi.validate({ name, email, password }, schema);
    console.log("validateReq----->", validateReq);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    Promise.coroutine(function* () {
        var autoReq = {
            name: name
        }
        var autoEx = yield commonFunction.makeRequest(config.get("api_url") + "auto", autoReq);
        console.log("autoEx--------->", autoEx);
        var reqBody = {
            name: name,
            email: email,
            password: password
        }
        var promiseEx = yield commonFunction.makeRequest(config.get("api_url") + "sign_up", reqBody);
        console.log("promiseEx--------->", promiseEx);
        var waterfallEx = yield commonFunction.makeRequest(config.get("api_url") + "signup_waterfall", reqBody);
        console.log("waterfallEx--------->", waterfallEx);
        var awaitEx = yield commonFunction.makeRequest(config.get("api_url") + "signup_await", reqBody);
        console.log("awaitEx--------->", awaitEx);
        var result = {
            "auto_response": autoEx.data,
            "promise_response": promiseEx.data,
            "waterfall_response": waterfallEx.data,
            "await_response": awaitEx.data
        }
        return result;
    })().then(result => {
        return response.actionCompleteResponse(res, result);
    }).catch(error => {
        console.log("error", error);
        return response.sendActionFailedResponse(res, [], error.message, error.status_code);
    });

}

async function signupAwait(req, res) {
    console.log("req.body------>", req.body);
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    var validateReq = Joi.validate({ name, email, password }, schema);
    console.log("validateReq----->", validateReq);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    try {
        var fetch = await commonFunction.fetchDataFromTable(email, password);
        console.log("fetch-------->", fetch);
        if (fetch) {
            return response.actionCompleteResponse(res, "email already exists");
        }
        var insertObj = {
            name: name,
            email: email,
            password: password,
        }
        console.log("insertObj-------->", insertObj);
        var insert = await commonFunction.insertIntoTable("users", insertObj);
        console.log("insert-------->", insert);
        if (insert.affectedRows == 1) {
            return response.actionCompleteResponse(res, "Data successfully inserted");
        }

    } catch (error) {
        console.log(error)
        return response.sendActionFailedResponse(res, [], error);
    }

}

function promiseToCb(req, res) {
    console.log("req.body------>", req.body);
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    var validateReq = Joi.validate({ name, email, password }, schema);
    console.log("validateReq----->", validateReq);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    var data = {
        email: email,
        password: password
    }
    async.series({
        one: function (callback) {
            setTimeout(function () {
                Promise.coroutine(function* () {
                    var fetch = yield commonFunction.fetchDataFromTable(data.email, data.password);
                    if (fetch) {
                        return ("email already exists");
                    }
                })().then(function (result) {
                    console.log("result-------------->", result);
                    callback(null, result);
                }, function (error) {
                    callback(null, error);
                });
            }, 200);
        },
        two: function (callback) {
            setTimeout(function () {
                callback(null, 2);
            }, 100);
        }
    },
        function (error, results) {
            if (error) {
                return response.sendActionFailedResponse(res, [], error);
            }
            console.log("result------------>", results);
            return response.actionCompleteResponse(res, results);
        });
}


setImmediatePromise('foobar').then((value) => {
    setTimeout(() => {
        console.log('************timeout***************');
    }, 0);
    console.log("************setImmediate************");
});

async function timerExample() {
    console.log('Before I/O callbacks');
    await setImmediatePromise();
    console.log('After I/O callbacks');
}

async function setImEx(req, res) {
    console.log("req.body------>", req.body);
    var email = req.body.email;
    var password = req.body.password;

    var schema = Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    });

    var validateReq = Joi.validate({ email, password }, schema);
    console.log("validateReq----->", validateReq);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    setTimeout(() => {
        console.log('timeout');
        var fetch = commonFunction.fetchDataFromTable(email, password);
        console.log("fetch-------->", fetch);
    }, 0);

    setImmediate(() => {
        console.log('immediate')
        var fetch = commonFunction.fetchDataFromTable(email, password);
        console.log("fetch---setImmediate----->", fetch);
    })
    return response.actionCompleteResponse(res, fetch);
}
