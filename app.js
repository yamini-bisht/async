const express     = require('express');
const bodyParser  = require('body-parser');
const mysql       = require('mysql');
const util        = require('util');
const setImmediatePromise = util.promisify(setImmediate);

const app = express();
config = require('config');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

const user = require('./routes/user');

const port = process.env.PORT || config.get('PORT')

app.post('/sign_up', user.signUp);
app.post('/check_email', user.checkEmailExistence);
app.post('/auto', user.exampleAuto);
app.post('/examples', user.examples);
app.post('/signup_waterfall', user.signupWaterfall)
app.post('/signup_await', user.signupAwait);
app.post('/promise_to_cb', user.promiseToCb);
app.get('/timer', user.timerExample);
app.post('/setim', user.setImEx);
app.post('/setImmediate_example', user.setImmediateEx);

connection = mysql.createConnection(config.get('database_settings'));

connection.connect(function (err) {              // The server is either down
    if (err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
    } else {
        console.log('database connected at...', config.get('database_settings.mysqlPORT'));
    }                                     // to avoid a hot loop, and to allow our node script to
});                                     // process asynchronous requests in the meantime.

const server = app.listen(port, function (err, data) {
    console.log(`Server running at ${port} `);
    if (err) {
        console.log(err);
    } else {
        setImmediatePromise().then((value) => {
            console.log("server connected!!!!");
        });
    }
});