/**
 * Created by prajasekaran on 12/19/2016.
 */

// Node-modules
var request = require('request');

// Application modules
var AuthTokenModule = require("../Authentication/AuthToken.js");
var TokenObj = new AuthTokenModule();
var AuthorizeModule = require("../UserMgmt/Authorization.js");
var AuthorizeObj = new AuthorizeModule();
var VendorModule = require("../VendorMgmt/VendorList.js");
var VendorModuleObj = new VendorModule();
var DBModel = require("../../../DBLayer/DBAccess/DBModel.js");
var dbModelObj = new DBModel();
var loginConfig = require("../../../Config/config.json");

function Login() {
    Login.prototype.authenticate = function (req, response, callback) {
        logger.info("Inside authenticate method");
        var options = loginConfig.login;
        options.form = {};
        options.form.corpid = req.body.corpid;
        options.form.password = req.body.password;
        logger.debug("options");
        logger.debug(options);
        request(options, function (err, res) {
            if (err) {
                return callback(err, null);
            } else {
                logger.debug("Response Body : ");
                logger.debug(res.body);
                if (!res.body) {
                    return callback(AppConstants.ERROR.ERR_NO_RESPONSE, null);
                }
                var result = res.body;
                var output = JSON.parse(result);
                //var output = result;
                logger.debug(output);
                if (output.auth) {
                    logger.debug("Authentication Success");
                    //Fetch user profile from Role collection
                    AuthorizeObj.getRoleAccess(output, function (err, accessData) {
                        if (err) {
                            logger.error("authenticate-getRoleAccess - Error");
                            return callback(err, null)
                        }
                        else {
                            logger.info("authenticate-getRoleAccess - Success");
                            output.screens = accessData.accessScreens;
                            if(accessData.role === AppConstants.VENDOR_MANAGER){
                                output.vendorDetails = accessData.vendorDetails;
                            }
                            var authTokenOj = {
                                corpid: output.corpid,
                                role: accessData.role
                            };
                            //Generate Authentication token
                            TokenObj.generateToken(authTokenOj, function (err, token) {
                                if (err) {
                                    logger.error("authenticate-generateToken - Error");
                                    return callback(err, null);
                                }
                                else {
                                    logger.info("authenticate-generateToken - Success");
                                    output.authToken = token;
                                    if(accessData.role === AppConstants.AWF){
                                        VendorModuleObj.getVendorForAWF(output, function (err, vendorData) {
                                            if (err) {
                                                return callback(err, null);
                                            } else {
                                                console.log(JSON.stringify(vendorData));
                                                output.vendorDetails = vendorData;
                                                return callback(null, output);
                                            }
                                        });
                                    }else{
                                        output.vendorDetails = {};
                                    }
                                }
                            });
                        }
                    });
                } else {
                    logger.debug("Authentication Failure");
                    return callback(AppConstants.ERROR.AUTH_FAILURE, null);
                }
            }
        });
    };

    Login.prototype.getUserInfo = function (req, response, data, callback) {
        if (!req.body.corpid) {
            return callback(AppConstants.ERROR.NO_CORPID, null);
        }
        var options = loginConfig.userInfo;
        options.qs = {};
        options.qs.corp = req.body.corpid;
        request(options, function (err, res) {
            if (err) {
                return callback(err, null);
            } else {
                var result = res.body;
                var output = JSON.parse(result);
                var chkUser = false;
                output.user.forEach(function (singleUser) {
                    if (singleUser.corpid === req.body.corpid) {
                        chkUser = true;
                        if ((singleUser.name).match(/\((.*?)\)/)) {
                            VendorModuleObj.getVendorForAWF(singleUser, function (err, vendorData) {
                                if (err) {
                                    return callback(err, null);
                                } else {
                                    console.log(JSON.stringify(vendorData));
                                    singleUser.vendorDetails = vendorData;
                                    return callback(null, {user: [singleUser]});
                                }
                            });
                        } else {
                            callback(AppConstants.ERROR.NOT_AWF, null);
                            logUserDetails(singleUser, data);
                        }
                    }
                });
                if (!chkUser) {
                    return callback(AppConstants.ERROR.USER_NOT_FOUND, null);
                }
            }
        });
    };

    function logUserDetails(singleUser, data) {
        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.INVALID_USER_ENTRIES, Obj);
        Obj.data = [{
            corpID: singleUser.corpid,
            name: singleUser.name,
            createdBy: data.corpid,
            createdDate: new Date()
        }];
        dbModelObj.postDataBulk(Obj, function (err, insertData) {
            if (err) {
                logger.error("logUserDetails");
            }
            else {
                logger.debug("logUserDetails");
            }
        });
    }

}


module.exports = Login;