var DBModel = require("../../../DBLayer/DBAccess/DBModel.js");
var dbModelObj = new DBModel();
var AbsenceModel = require("./AbsenceModel.js");
var AbsenceModelObj = new AbsenceModel();

function AbsenceMgmt() {

    AbsenceMgmt.prototype.getAbsenceHistory = function (req, res, tokenData, callback) {

        var absenceObj = AbsenceModelObj.fetchAbsenceData(tokenData, req);
        dbModelObj.getData(absenceObj, function (err, data) {
            if (err) {
                logger.error("getAbsenceHistory - Error");
                return callback(err, null)
            }
            else {
                logger.info("getAbsenceHistory - Success");
                var result = [];
                if (data.length > 0) {
                    result = AbsenceModelObj.formatDateFields(data);
                }
                return callback(null, result);
            }
        });
    };


    AbsenceMgmt.prototype.postAbsence = function (req, res, tokenData, callback) {

        logger.info("In postAbsence");
        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.ABSENCE_MARKER, Obj);
        Obj.dataToInsert = AppUtils.frameInsertData(tokenData.corpid, req);
        Obj['role'] = tokenData.role;
        AppUtils.insertData(Obj, AppConstants.DB.ABSENCE_MARKER, function (err, data) {
            if (err) {
                logger.error("postAbsence-insertData");
                return callback(err, null);
            } else {
                logger.debug("postAbsence-insertData");
                return callback(null, data);
            }
        });
    };

    AbsenceMgmt.prototype.updateAbsence = function (req, res, tokenData, callback) {
        logger.info("In updateAbsence");
        var Obj = {};
        Obj = dbModelObj.getCommonData(AppConstants.DB.ABSENCE_MARKER, Obj);
        Obj.query = {absenceID: req.body.data.absenceID};
        Obj.modifiedBy = tokenData.corpid;
        AppUtils.updateData(Obj, AppConstants.DB.ABSENCE_MARKER, req, function (err, data) {
            if (err) {
                logger.error("updateAbsence-updateData");
                return callback(err, null);
            } else {
                logger.debug("updateAbsence-updateData");
                return callback(null, data);
            }
        });
    };

}

module.exports = AbsenceMgmt;