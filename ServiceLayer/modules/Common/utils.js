/**
 * Created on 1/3/2017.
 */
var EmailModule = require("./EMailNotification.js");
var EmailModuleObj = new EmailModule();
var DBModel = require("../../../DBLayer/DBAccess/DBModel.js");
var dbModelObj = new DBModel();
var DBConfig = require("../../../Config/dbConfig.json");

function utils() {
    utils.prototype.insertData = function (Obj, moduleName, callback) {
        dbModelObj.getUniqueID(Obj, function (err, result) {
            if (err) {
                logger.error("utils-getUniqueID");
                return callback(err, null);
            } else {
                Obj.dataToInsert[Obj.uniqueID] = result;
                Obj.dataToInsert['displayID'] = getDisplayID(moduleName) + result;
                dbModelObj.postData(Obj, function (err, data) {
                    if (err) {
                        logger.error("utils-postData");
                        return callback(err, null);
                    }
                    else {
                        logger.debug("utils-postData");
                        //Send mail notification on successful insertion of data to DB
                        var emailObj = {};
                        emailObj['moduleName'] = moduleName;
                        emailObj['methodName'] = "POST";
                        emailObj['data'] = data;
                        emailObj['designation'] = Obj.role;
                        EmailModuleObj.constructMailOptions(emailObj, function (err, mailData) {
                            if (err) {
                                logger.error("utils-postData-sendEmail");
                                return callback(err, null);
                            } else {
                                return callback(null, data);
                            }
                        });
                    }
                });
            }
        });
    };

    utils.prototype.updateData = function (Obj, moduleName,req, callback) {
        dbModelObj.getData(Obj, function (err, findResult) {
            if (err) {
                logger.error("utils-updateData-getData");
                return callback(err, null);
            } else {
                //Update modified details to DB
                Obj.dataToUpdate = JSON.parse(JSON.stringify(req.body.data));
                delete Obj.dataToUpdate[Obj.uniqueID];
                Obj.dataToUpdate['modifiedBy'] = Obj.modifiedBy;
                Obj.dataToUpdate = {$set: Obj.dataToUpdate,$push:{workflow:{workDoneBy:Obj.modifiedBy,workDoneDate:new Date(),workStatus:Obj.dataToUpdate.status,assignedTo:[]}}};
                Obj.options = {};
                dbModelObj.putData(Obj, function (err, data) {
                    if (err) {
                        logger.error("utils-updateData-putData");
                        return callback(err, null);
                    }
                    else {
                        logger.debug("utils-updateData-putData");
                        callback(null, data);
                        if (data.nModified) {
                            mailForUpdate(Obj,moduleName);
                            auditSave(Obj,moduleName, findResult);
                        }
                    }
                });
            }
        });
    };

    utils.prototype.frameInsertData = function(corpid,req){
        var Obj = {};
        Obj.dataToInsert = req.body.data;
        Obj.dataToInsert['createdBy'] = corpid;
        Obj.dataToInsert['modifiedBy'] = corpid;
        Obj.dataToInsert['workflow'] = [{workDoneBy:corpid,workDoneDate:new Date(),workStatus:"submitted",comments:"Leave Request Raised",assignedTo:[req.body.data.managerName]}];
        return Obj.dataToInsert;
    };

    function getDisplayID(moduleName){
        if(moduleName === AppConstants.DB.ABSENCE_MARKER){
            return "ABS-0";
        }
        if(moduleName === AppConstants.DB.PERFORMANCE_ISSUE){
            return "PERF-0";
        }
    }

    function mailForUpdate(Obj,moduleName){
        var emailObj = {};
        emailObj['moduleName'] = moduleName;
        emailObj['methodName'] = "PUT";
        dbModelObj.getData(Obj, function (err, data) {
            if (err) {
                logger.error("utils-mailForUpdate-getData");
            }
            else {
                emailObj['data'] = data[0];
                EmailModuleObj.constructMailOptions(emailObj, function (err, mailData) {
                    if (err) {
                        logger.error("utils-mailForUpdate-sendEmail");
                    } else {
                        logger.debug("utils-mailForUpdate-sendEmail");
                    }
                });
            }
        });
    }

    function auditSave(Obj,moduleName, findResult) {
        logger.debug("In auditSave");
        Obj.dbName = DBConfig[moduleName].auditDBName;
        Obj.data = JSON.parse(JSON.stringify(findResult));
        delete Obj.data[0]._id;
        delete Obj.data[0].__v;
        dbModelObj.postDataBulk(Obj, function (err, result) {
            if (err) {
                logger.error("Error while inserting record to AuditDB: " + err);
            } else {
                logger.debug("Successfully inserted record to AuditDB: " + JSON.stringify(result));
            }
        });
    }
}

module.exports = utils;