/**
 * Created on 1/18/2017.
 */


var DBModel = require("../../../DBLayer/DBAccess/DBModel.js");
var dbModelObj = new DBModel();

function PerformanceModel(){
    PerformanceModel.prototype.fetchPerfData = function(data,request){
        //Fetch Performance Issue Details from DB based on user profile
        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.PERFORMANCE_ISSUE, Obj);
        Obj.query = {};
        if (data.role === AppConstants.AWF) {
            Obj.query['paypalID'] = data.corpid;
        } else if (data.role === AppConstants.PAYPAL_MANAGER) {
            Obj.query['managerName'] = new RegExp(data.corpid);
        } else if (data.role === AppConstants.VENDOR_MANAGER) {
            Obj.query['vendorManagerID'] = new RegExp(data.corpid);
        }
        Obj.skipValue = request.query.skip ? request.query.skip : 0;
        Obj.limitValue = request.query.limit ? request.query.limit : 0;
        return Obj;
    };
}

module.exports = PerformanceModel;