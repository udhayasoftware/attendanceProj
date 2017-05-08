/**
 * Created on 1/2/2017.
 */

"use strict";
var crypto = require('crypto');

var DBModel = require("../../../DBLayer/DBAccess/DBModel.js");
var dbModelObj = new DBModel();

function AuthToken() {
    AuthToken.prototype.generateToken = function (reqObj, callBack) {
        var authObj = {}, Obj = {};
        Obj.data = reqObj;
        //get encrypted data
        var encrypted = encrypt(Obj);
        // calculate validity time
        var tokenValidTime = (new Date().getTime()) + (AppConstants.TOKEN_VALID_TIME * 60000);
        // insert data to AuthToken table
        authObj = dbModelObj.getCommonData(AppConstants.DB.AUTH_TOKEN, authObj);
        authObj.query = {paypalID: Obj.data.corpid};
        authObj.dataToUpdate = {
            $set: {
                paypalID: Obj.data.corpid,
                token: encrypted,
                validTime: new Date(tokenValidTime),
                createdBy: Obj.data.corpid,
                modifiedBy: Obj.data.corpid,
                createdDate: Date.now()
            }
        };
        authObj.options = {upsert: true};
        dbModelObj.putData(authObj, function (err, data) {
            if (err) {
                logger.error("generateToken-putData - Error");
                return callBack(AppConstants.ERROR.ERR_UPDATE + err, null)
            }
            else {
                logger.info("generateToken-putData - Success");
                return callBack(null, encrypted);
            }
        });
    };

    AuthToken.prototype.validateToken = function (tokenObj, callBack) {

        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.AUTH_TOKEN, Obj);
        Obj.query = {};
        Obj.query['token'] = tokenObj.headers.authtoken;
        dbModelObj.getData(Obj, function (err, data) {
            if (err) {
                logger.error("validateToken - Error");
                return callBack(err, null)
            }
            else {
                logger.info("validateToken - Success");
                if (data.length <= 0) {
                    return callBack(AppConstants.ERROR.INVALID_USER, null);
                } else {
                    if (new Date() > new Date(data[0].validTime)) {
                        return callBack(AppConstants.ERROR.USER_SESSION_EXPIRED, null);
                    }else{
                        // Get corpid and role from encrypted value
                        var decryptData = decrypt(data[0].token);
                        var decryptArr = decryptData.split('-');
                        //Extend vaidiity time
                        var authObj = {};
                        var tokenValidTime = (new Date().getTime()) + (AppConstants.TOKEN_VALID_TIME * 60000);
                        // insert data to AuthToken table
                        authObj = dbModelObj.getCommonData(AppConstants.DB.AUTH_TOKEN, authObj);
                        authObj.query = {paypalID: decryptArr[0]};
                        authObj.dataToUpdate = {
                            $set: {
                                validTime: new Date(tokenValidTime),
                                modifiedBy: decryptArr[0]
                            }
                        };
                        authObj.options = {upsert: true};
                        dbModelObj.putData(authObj, function (err, data) {
                            if (err) {
                                logger.error("validateToken-putData - Error");
                                return callBack(AppConstants.ERROR.ERR_UPDATE + err, null);
                            }
                            else {
                                logger.info("validateToken-putData - Success");
                                return callBack(null, {corpid:decryptArr[0],role:decryptArr[1]});
                            }
                        });
                    }
                }

            }
        });
    };

    function encrypt(Obj) {
        var key = AppConstants.ACCESS_KEY;
        var iv = new Buffer('0000000000000001');
        var decodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest();
        var cipher = crypto.createCipheriv('aes-256-cbc', decodeKey, iv);
        var encryptedVal = cipher.update(Obj.data.corpid + "-" + Obj.data.role + "-" + new Date().getTime(), 'utf8', 'hex') + cipher.final('hex');
        return encryptedVal;
    }

    function decrypt(encryptVal){
        var key = AppConstants.ACCESS_KEY;
        var iv = new Buffer('0000000000000001');
        var encodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest();
        var cipher = crypto.createDecipheriv('aes-256-cbc', encodeKey, iv);
        return (cipher.update(encryptVal, 'hex', 'utf8') + cipher.final('utf8'));
    }
}

module.exports = AuthToken;

