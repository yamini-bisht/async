const request = require('request');
const Promise = require('bluebird');
const Joi = require('joi');
const async = require('async');
const emailExistence = require("email-existence");
const fs = require('fs');
const util = require('util');
const setImmediatePromise = util.promisify(setImmediate);


const response = require('./responses');
const commonFunction = require('./commonFunction');
const moment = require('moment');

exports.signUp = signUp;
exports.signupWaterfall = signupWaterfall;
exports.checkEmailExistence = checkEmailExistence;
exports.exampleAuto = exampleAuto;
exports.examples = examples;
exports.signupAwait = signupAwait;
exports.promiseToCb = promiseToCb;
exports.timerExample = timerExample;
exports.setImEx = setImEx;
exports.setImmediateEx = setImmediateEx;

function signUp(req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    let schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    let validateReq = Joi.validate({ name, email, password }, schema);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }

    Promise.coroutine(function* () {
        let insertObj = {
            name: name,
            email: email,
            password: password,
        }
        let insert = yield commonFunction.insertIntoTable("users", insertObj);
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
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    let schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    let validateReq = Joi.validate({ name, email, password }, schema);
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
                return response.actionCompleteResponse(res, "Email already exits...");
            }
            else {
                callback(null);
            }
        },

        function (callback) {
            let insert = `INSERT into users (name, email, password) values(
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
    let name = req.body.name;
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
            return response.actionCompleteResponse(res, dataToBeUsed);
        }]
    });
}


function checkEmail(email, callback) {
    emailExistence.check(email, function (error, response) {
        if (error) {
            console.log(error);
        }
        return callback(null, response);
    });
};

function checkEmailExistence(req, res) {
    let email = req.body.email;

    let schema = Joi.object().keys({
        email: Joi.string().required()
    });

    let validateReq = Joi.validate({ email }, schema);
    return new Promise((resolve, reject) => {
        Promise.coroutine(function* () {
            let emailExistenceCheck = Promise.promisify(checkEmail);
            let CheckEmailExistence = yield emailExistenceCheck(email);
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
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    let schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    let validateReq = Joi.validate({ name, email, password }, schema);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    Promise.coroutine(function* () {
        let autoReq = {
            name: name
        }
        let autoEx = yield commonFunction.makeRequest(config.get("api_url") + "auto", autoReq);
        let reqBody = {
            name: name,
            email: email,
            password: password
        }
        let promiseEx = yield commonFunction.makeRequest(config.get("api_url") + "sign_up", reqBody);
        let waterfallEx = yield commonFunction.makeRequest(config.get("api_url") + "signup_waterfall", reqBody);
        let awaitEx = yield commonFunction.makeRequest(config.get("api_url") + "signup_await", reqBody);
        let result = {
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
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    let schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    let validateReq = Joi.validate({ name, email, password }, schema);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    try {
        let fetch = await commonFunction.fetchDataFromTable(email, password);
        if (fetch) {
            return response.actionCompleteResponse(res, "email already exists");
        }
        let insertObj = {
            name: name,
            email: email,
            password: password,
        }
        let insert = await commonFunction.insertIntoTable("users", insertObj);
        if (insert.affectedRows == 1) {
            return response.actionCompleteResponse(res, "Data successfully inserted");
        }

    } catch (error) {
        console.log(error)
        return response.sendActionFailedResponse(res, [], error);
    }

}

function promiseToCb(req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    let schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.any().required(),
    });

    let validateReq = Joi.validate({ name, email, password }, schema);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    let data = {
        email: email,
        password: password
    }
    async.series({
        one: function (callback) {
            setTimeout(function () {
                Promise.coroutine(function* () {
                    let fetch = yield commonFunction.fetchDataFromTable(data.email, data.password);
                    if (fetch) {
                        return ("email already exists");
                    }
                })().then(function (result) {
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
    let email = req.body.email;
    let password = req.body.password;

    let schema = Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    });

    let validateReq = Joi.validate({ email, password }, schema);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    setTimeout(() => {
        let fetch = commonFunction.fetchDataFromTable(email, password);
    }, 0);

    setImmediate(() => {
        let fetch = commonFunction.fetchDataFromTable(email, password);
    })
    return response.actionCompleteResponse(res, fetch);
}

/*
 Here we are recursively calling the step function from the setImmediate handler.
 The nextTick handler will run at the end of the current operation interrupting the event loop,
 so even though it was registered second it will actually run first.

 Calling nextTick recursively can end up blocking the event loop from continuing.
 SetImmediate sfire the check phase of the event loop, allowing event loop to continue.
*/


function setImmediateEx(req, res){
    let iteration = req.body.iteration;

    let schema = Joi.object().keys({
        iteration: Joi.number().integer()
    });

    let validateReq = Joi.validate({iteration }, schema);
    if (validateReq.error) {
        console.log(validateReq.error);
        return response.parameterMissingResponse(res, "", []);
    }
    function step(iteration) {
        if (iteration === 10){
            return response.actionCompleteResponse(res, iteration);
        } 
        setImmediate(() => {
          console.log(`setImmediate iteration: ${iteration}`);
          step(iteration + 1); // Recursive call from setImmediate handler.
        });
        process.nextTick(() => {
          console.log(`nextTick iteration: ${iteration}`);
        });
      }
    step(iteration);
}

function step(iteration) {
    if (iteration === 10) return;
    process.nextTick(() => {
      console.log(`nextTick iteration: ${iteration}`);
      step(iteration + 1);
    });
  }
step(0);
