const Promise     = require('bluebird');
const request     = require('request');

exports.makeRequest   = makeRequest;

function makeRequest (url, reqBody) {
    return new Promise((resolve, reject) => {
        let options = {
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
                return resolve(body);
            }
        });
    });
};

exports.insertIntoTable = (tableName, insertObj) => Promise.coroutine(function*(){
    let stmt = `INSERT INTO ${tableName} SET ?`;
    return new Promise((resolve, reject) => {
        let query = connection.query( stmt, [insertObj], function (error, result) {
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
    let stmt = ` SELECT * FROM users WHERE email = ? AND password = ? `;
    return new Promise((resolve, reject) => {
        let query = connection.query( stmt, [email, password], function (error, result) {
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