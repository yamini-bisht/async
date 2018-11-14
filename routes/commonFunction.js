var Promise     = require('bluebird');
var request     = require('request');

exports.makeRequest   = makeRequest;

function makeRequest (url, reqBody) {
    return new Promise((resolve, reject) => {
        console.log("url----------->", url, reqBody);
        var options = {
            uri: url,
            method: 'POST',
            headers: {
                name: 'content-type',
                value: 'application/x-www-form-urlencoded'
            },
            json: reqBody
        };
        request(options, (error, response, body) => {
            if (error) {
                console.log(error)
                return reject(error);
            } else {
                console.log('Status:_____________', response.statusCode);
                console.log('Headers:-----------', JSON.stringify(response.headers));
                console.log('Response:+++++++++++++', body);
                return resolve(body);
            }
        });
    });
};

exports.insertIntoTable = (tableName, insertObj) => Promise.coroutine(function*(){
    var stmt = `INSERT INTO ${tableName} SET ?`;
    return new Promise((resolve, reject) => {
        var query = connection.query( stmt, [insertObj], function (error, result) {
            // console.log("this is sql query :- ",query.sql,error)
            if(error){
                return reject(error);
            }
            return resolve (result);
        });
    });
    return DBHandler(event, stmt, [insertObj] );
})().catch(err=>{
    throw err;
});

exports.fetchDataFromTable = (email, password) => Promise.coroutine(function*(){
    var stmt = ` SELECT * FROM users WHERE email = ? AND password = ? `;
    return new Promise((resolve, reject) => {
        var query = connection.query( stmt, [email, password], function (error, result) {
            // console.log("this is sql query :- ",query.sql,error)
            if(error){
                return reject(error);
            }
            return resolve (result);
        });
    });
    return DBHandler(event, stmt, [insertObj] );
})().catch(err=>{
    throw err;
});