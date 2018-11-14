function define(obj, name, value) {
    Object.defineProperty(obj, name, {
        value: value,
        enumerable: true,
        writable: false,
        configurable: true
    });
}

exports.responseStatus = {};
define(exports.responseStatus, 'PARAMETER_MISSING', 100);
define(exports.responseStatus, 'INVALID_KEY', 101);
define(exports.responseStatus, 'ACTION_COMPLETE', 200);
define(exports.responseStatus, 'SHOW_ERROR_MESSAGE', 201);
define(exports.responseStatus, 'ERROR_IN_EXECUTION', 404);