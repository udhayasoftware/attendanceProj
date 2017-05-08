/**
 * Created on 1/18/2017.
 */

var DBModel = require("../../../DBLayer/DBAccess/DBModel.js");
var dbModelObj = new DBModel();
var PerfModel = require("./PerformanceModel.js");
var PerfModelObj = new PerfModel();

function PerformanceIssue(){

    PerformanceIssue.prototype.getPerformanceIssueHistory = function(req, res, tokenData, callback){

        var perfObj = PerfModelObj.fetchPerfData(tokenData, req);
        dbModelObj.getData(perfObj, function (err, data) {
            if (err) {
                logger.error("getPerformanceIssueHistory - Error");
                return callback(err, null)
            }
            else {
                logger.info("getPerformanceIssueHistory - Success");
                /*var result = [];
                if (data.length > 0) {
                    result = AbsenceModelObj.formatDateFields(data);
                }*/
                var result = data;
                return callback(null, result);
            }
        });
    };

    PerformanceIssue.prototype.postPerformanceIssue = function (req, res, tokenData, callback) {

        logger.info("In postPerformanceIssue");
        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.PERFORMANCE_ISSUE, Obj);
        Obj.dataToInsert = AppUtils.frameInsertData(tokenData.corpid, req);
        Obj['role'] = tokenData.role;
        AppUtils.insertData(Obj, AppConstants.DB.PERFORMANCE_ISSUE, function (err, data) {
            if (err) {
                logger.error("postPerformanceIssue-insertData");
                return callback(err, null);
            } else {
                logger.debug("postPerformanceIssue-insertData");
                return callback(null, data);
            }
        });
    };

    PerformanceIssue.prototype.putPerformanceIssue = function (req, res, tokenData, callback) {
        logger.info("In putPerformanceIssue");
        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.PERFORMANCE_ISSUE, Obj);
        Obj.query = {performanceID: req.body.data.performanceID};
        Obj.modifiedBy = tokenData.corpid;
        AppUtils.updateData(Obj, AppConstants.DB.PERFORMANCE_ISSUE, req, function (err, data) {
            if (err) {
                logger.error("putPerformanceIssue-updateData");
                return callback(err, null);
            } else {
                logger.debug("putPerformanceIssue-updateData");
                return callback(null, data);
            }
        });

    };
}

module.exports = PerformanceIssue;