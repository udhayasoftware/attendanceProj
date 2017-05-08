/**
 * Created on 12/15/2016.
 */

var express = require('express');
var multer = require('multer');
var path = require('path');
var cookieParser = require('cookie-parser');
//var expressSession = require('express-session');
var bodyParser = require('body-parser');
var router = require('./routes/router');
var loggerModule = require('./logger.js');
AppConstants = require('./modules/Common/AppConstants.js');
var Utils = require('./modules/Common/utils.js');
AppUtils = new Utils();
process.userContext = {};

var app = express();

app.use(cookieParser('pvmcokkie'));

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(multer({dest:'./uploads/'}).fields([{ name: 'PositionProfile', maxCount: 5 }]));

app.all("/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, authtoken");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    return next();
});

app.all("*", router);
app.all("/*", router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


module.exports = app;
app.listen(3000);
logger.info("Listening on port 3000");