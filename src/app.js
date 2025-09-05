//Simple login demo. This is the server side NodeJS script.
const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const session = require('express-session');
const bodyParser = require("body-parser"); //to parse post requests
const routes = require('./routes/index');

app.use(session({
    secret: 'a-very-secret-key-that-should-be-in-env-vars',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/', routes);

http.listen(82, function () {
    console.log('listening on 85.110.66.60:82');
});
