/**
 * Created on 1/10/2017.
 */
var DBModel = require("../../../DBLayer/DBAccess/DBModel.js");
var dbModelObj = new DBModel();

function AbsenceModel(){
    AbsenceModel.prototype.fetchAbsenceData = function(data,request){
        //Fetch Absence Details from DB based on user profile
        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.ABSENCE_MARKER, Obj);
        Obj.query = {};
        if (data.role === AppConstants.AWF) {
            Obj.query['paypalID'] = data.corpid;
        } else if (data.role === AppConstants.PAYPAL_MANAGER) {
            Obj.query['managerName'] = new RegExp(data.corpid);
        } else if (data.role === AppConstants.VENDOR_MANAGER) {
            Obj.query['vendorManagerID'] = new RegExp(data.corpid);
        }
        Obj.query.status = {$ne:"withdrawn"};
        Obj.skipValue = request.query.skip ? request.query.skip : 0;
        Obj.limitValue = request.query.limit ? request.query.limit : 0;
        return Obj;
    };

    AbsenceModel.prototype.formatDateFields = function(data){
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        var outputData = [];
        data.forEach(function(singleRow){
            var obj = {};
            obj = JSON.parse(JSON.stringify(singleRow));
           if(singleRow.leaveFrom){
               obj.leaveFrom = singleRow.leaveFrom.getDate() + "-" + monthNames[singleRow.leaveFrom.getMonth()] + "-" + singleRow.leaveFrom.getFullYear();
           }
            if(singleRow.leaveTo){
                obj.leaveTo = singleRow.leaveTo.getDate() + "-" + monthNames[singleRow.leaveTo.getMonth()] + "-" + singleRow.leaveTo.getFullYear();
            }
            if(singleRow.createdDate){
                obj.createdDate = singleRow.createdDate.getDate() + "-" + monthNames[singleRow.createdDate.getMonth()] + "-" + singleRow.createdDate.getFullYear();
            }
            outputData.push(obj);
        });
        return outputData;
    };

}

module.exports = AbsenceModel;