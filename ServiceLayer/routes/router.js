var express = require('express');
var router = express.Router();

var AuthTokenModule = require("../modules/Authentication/AuthToken.js");
var TokenObj = new AuthTokenModule();
var LoginModule = require('../modules/Login/Login.js');
var loginObj = new LoginModule();
var AbsenceModule = require('../modules/AbsenceMgmt/AbsenceServiceHandler');
var AbsenceModuleObj = new AbsenceModule();
var VendorModule = require('../modules/VendorMgmt/VendorList.js');
var VendorObj = new VendorModule();
var PerfModule = require('../modules/PerformanceMgmt/PerformanceIssueServiceHandler.js');
var PerfObj = new PerfModule();

router.get('/*', function (request, response) {
    var url = (request.url).split('?')[0];
    switch (url) {
        case '/home' :
            logger.info("in home");
            response.send("In home");
            break;
        default :
            responseHandler(response, 'Err 404 : Page Not found', null);
            break;
    }
});

/*router.post('/!*', function (request, response, next) {
 var url = (request.url).split('?')[0];
 switch (url) {
 case '/home':
 logger.info("in home");
 response.send("In home");
 break;
 case '/login':
 logger.info("in Login router");
 loginObj.authenticate(request,response,function(err,data){
 responseHandler(response,err,data);
 });
 break;
 case '/getUserInfo':
 logger.info("in getUserInfo router");
 loginObj.getUserInfo(request,response,function(err,data){
 responseHandler(response,err,data);
 });
 break;
 case '/getVendorInfo':
 logger.info("in getVendorInfo router");
 VendorObj.getVendorInfo(request,response,function(err,data){
 responseHandler(response,err,data);
 });
 break;
 case '/getAbsence':
 logger.info("in getAbsence router");
 AbsenceModuleObj.getAbsenceHistory(request,response,function(err,data){
 responseHandler(response,err,data);
 });
 break;
 case '/postAbsence' :
 logger.info("in postAbsence router");
 AbsenceModuleObj.postAbsence(request,response,function(err,data){
 responseHandler(response,err,data);
 });
 break;
 case '/putAbsence' :
 logger.info("in putAbsence router");
 AbsenceModuleObj.updateAbsence(request,response,function(err,data){
 responseHandler(response,err,data);
 });
 break;
 default :
 responseHandler(response,'Err 404 : Page Not found',null);
 break;
 }
 });*/

router.post('/*', function (request, response, next) {
    var url = (request.url).split('?')[0];
    if (url === "/login") {
        logger.info("******** In Login router ********");
        loginObj.authenticate(request, response, function (err, data) {
            responseHandler(response, err, data);
        });
    } else {
        if (!request.headers.authtoken) {
            responseHandler(response, AppConstants.ERROR.NO_TOKEN, null);
        }
        TokenObj.validateToken(request, function (err, tokenData) {
            if (err) {
                logger.error("validate - Error");
                responseHandler(response, err, null);
            }
            else {
                switch (url) {
                    case '/home':
                        logger.info("******** In home ********");
                        response.send("In home");
                        break;
                    case '/getUserInfo':
                        logger.info("******** In getUserInfo router ********");
                        loginObj.getUserInfo(request, response, tokenData, function (err, data) {
                            responseHandler(response, err, data);
                        });
                        break;
                    case '/getVendorInfo':
                        logger.info("******** In getVendorInfo router ********");
                        VendorObj.getVendorInfo(request, response, function (err, data) {
                            responseHandler(response, err, data);
                        });
                        break;
                    case '/getAbsence':
                        logger.info("******** In getAbsence router ********");
                        AbsenceModuleObj.getAbsenceHistory(request, response, tokenData, function (err, data) {
                            responseHandler(response, err, data);
                        });
                        break;
                    case '/postAbsence' :
                        logger.info("******** In postAbsence router ********");
                        AbsenceModuleObj.postAbsence(request, response, tokenData, function (err, data) {
                            responseHandler(response, err, data);
                        });
                        break;
                    case '/putAbsence' :
                        logger.info("******** In putAbsence router ********");
                        AbsenceModuleObj.updateAbsence(request, response, tokenData, function (err, data) {
                            responseHandler(response, err, data);
                        });
                        break;
                    case '/getPerformanceIssueHistory':
                        logger.info("******** In getPerformanceIssueHistory router ********");
                        PerfObj.getPerformanceIssueHistory(request, response, tokenData, function (err, data) {
                            responseHandler(response, err, data);
                        });
                        break;
                    case '/postPerformanceIssue':
                        logger.info("******** In postPerformanceIssue router ********");
                        PerfObj.postPerformanceIssue(request, response, tokenData, function (err, data) {
                            responseHandler(response, err, data);
                        });
                        break;
                    case '/putPerformanceIssue':
                        logger.info("******** In putPerformanceIssue router ********");
                        PerfObj.putPerformanceIssue(request, response, tokenData, function (err, data) {
                            responseHandler(response, err, data);
                        });
                        break;
                    default :
                        responseHandler(response, 'Err 404 : Page Not found', null);
                        break;
                }
            }
        });
    }
});

function responseHandler(res, err, data) {
    res.responseObj = {};
    if (err) {
        res.responseObj.status = "Failure";
        res.responseObj.error = err;
    } else {
        res.responseObj.status = "Success";
        res.responseObj.data = data;
    }
    res.send(res.responseObj);
}

module.exports = router;


