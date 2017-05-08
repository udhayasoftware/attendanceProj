/**
 * Created on 1/6/2017.
 */

var DBModel = require("../../../DBLayer/DBAccess/DBModel.js");
var dbModelObj = new DBModel();

function VendorList() {
    VendorList.prototype.getVendorInfo = function (req, res, callback) {

        logger.info("In getVendorInfo");
        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.VENDOR_LIST, Obj);
        Obj.query = {status: "active"};
        dbModelObj.getData(Obj, function (err, vendorData) {
            if (err) {
                logger.error("getVendorInfo - Error");
                return callback(err, null);
            }
            else {
                logger.info("getVendorInfo - Success");
                var responseArr = [];
                vendorData.forEach(function (singleData) {
                    responseArr.push({
                        label: singleData.vendorName,
                        value: singleData.vendorName,
                        vendorManagerID: ((singleData.paypalEmail).split('@'))[0]
                    });
                });
                return callback(null, responseArr);
            }
        });

    };

    VendorList.prototype.getVendorForAWF = function (req, callback) {

        logger.info("In getVendorForAWF");
        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.AWF_VENDOR_MAPPING, Obj);
        Obj.query = {SAM_LOGIN_ID: req.corpid};
        dbModelObj.getData(Obj, function (err, vendorData) {
            if (err) {
                logger.error("getVendorForAWF - Error");
                return callback(err, null);
            }
            else {
                var vendorDetails = {};
                if (vendorData.length > 0) {
                    Obj = dbModelObj.getCommonData(AppConstants.DB.VENDOR_LIST, Obj);
                    Obj.query = {vendorName: vendorData[0].SAM_PREFERRED_VENDOR};
                    dbModelObj.getData(Obj, function (err, data) {
                        if (err) {
                            logger.error("getVendorForAWF_VendorList - Error");
                            return callback(err, null);
                        }
                        else {
                            if (data.length > 0) {
                                vendorDetails.vendorID = data[0].vendorID;
                                vendorDetails.vendorName = data[0].vendorName;
                                vendorDetails.vendorManagerID = ((data[0].paypalEmail).split('@'))[0];
                            }
                            return callback(null, vendorDetails);
                        }
                    });
                } else {
                    return callback(null, vendorDetails);
                }
            }
        });
    };
}

module.exports = VendorList;