/**
 * Created on 1/7/2017.
 */

var DBModel = require("../../../DBLayer/DBAccess/DBModel.js");
var dbModelObj = new DBModel();

function Authorization() {
    Authorization.prototype.getRoleAccess = function (reqObj, callback) {
        var Obj = {};
        if ((reqObj.name).match(/\((.*?)\)/)) {
            Obj = dbModelObj.getCommonData(AppConstants.DB.VENDOR_LIST, Obj);
            // check for VendorManager or AWF
            Obj.query = {paypalEmail: new RegExp(reqObj.corpid)};
            dbModelObj.getData(Obj, function (err, data) {
                if (err) {
                    logger.error("getRoleAccess_VendorList - Error");
                    return callback(err, null);
                }
                else {
                    logger.debug("getRoleAccess - Success");
                    var accessObj = {},vendorDetailsObj = {};
                    accessObj = dbModelObj.getCommonData(AppConstants.DB.AUTHORIZATION, accessObj);
                    //If record is present in VendorList table , then it is Vendor Manager else AWF
                    if (data.length > 0) {
                        accessObj.query = {role: AppConstants.VENDOR_MANAGER};
                        vendorDetailsObj['vendorID'] = data[0].vendorID;
                        vendorDetailsObj['vendorName'] = data[0].vendorName;
                        vendorDetailsObj['vendorManagerID'] = ((data[0].paypalEmail).split('@'))[0];
                    } else {
                        accessObj.query = {role : AppConstants.AWF};
                        vendorDetailsObj['vendorID'] = 23;
                        vendorDetailsObj['vendorName'] = "CTS";
                        vendorDetailsObj['vendorManagerID'] = "sriram";
                    }
                    dbModelObj.getData(accessObj, function (err, screens) {
                        if (err) {
                            logger.error("getRoleAccess_Authorization - Error");
                            return callback(err, null)
                        }
                        else {
                            logger.debug("getRoleAccess_Authorization - Success");
                            return callback(null, {role: accessObj.query.role, accessScreens: screens[0].screens,vendorDetails:vendorDetailsObj});
                        }
                    });
                }
            });
        } else {
            //If round braces not present in name field from login response , then it is PayPal Manager
            var accessObj = {};
            accessObj = dbModelObj.getCommonData(AppConstants.DB.AUTHORIZATION, accessObj);
            accessObj.query = {role : AppConstants.PAYPAL_MANAGER};
            dbModelObj.getData(accessObj, function (err, screens) {
                if (err) {
                    logger.error("getRoleAccess_Authorization - Error");
                    return callback(err, null)
                }
                else {
                    logger.debug("getRoleAccess_Authorization - Success");
                    return callback(null, {role: accessObj.query.role, accessScreens: screens[0].screens,vendorDetails:{}});
                }
            });
        }
    };

}

module.exports = Authorization;