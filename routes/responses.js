var constants = require('./constants');

exports.actionCompleteResponse = function (res, data, msg) {
    var response = {
        "message": msg || "Successfully completed",
        "status": constants.responseStatus.SUCCESSFUL,
        "data" : data || []
    };
    res.send(JSON.stringify(response));
};

exports.parameterMissingResponse = function (res, err, data) {
    var response = {
        "message": err || "Insufficient information provided",
        "status": constants.responseStatus.PARAMETER_MISSING,
        "data" : data || {}
    };
    res.send(JSON.stringify(response));
};

exports.sendActionFailedResponse = function(res, data, msg, statusCode){
    var response = {
        message : msg || "Action failed. Please try again.",
        status : statusCode || constants.responseStatus.SHOW_ERROR_MESSAGE
    }
    res.send(response);
};

exports.databaseError = function (res, err, data) {
    var response = {
        "message": err || "Database Error. Insufficient information.",
        "status": 102,
        "data" : data || {}
    };
    res.send(JSON.stringify(response));
};