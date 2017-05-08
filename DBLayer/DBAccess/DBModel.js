"use strict";

var mongoose = require("mongoose");

var Connection = require("./Connection.js");
var ConnectionObj = new Connection();
var config = require("../../Config/dbConfig.json");

function DBModel() {

    DBModel.prototype.getCommonData = function (key, Obj) {
        Obj.dbName = config[key].dbName;
        Obj.collectionName = config[key].collectionName;
        Obj.uniqueID = config[key].uniqueID;
        return Obj;
    };

    DBModel.prototype.getData = function (Obj, callback) {

        logger.info("in getData");
        ConnectionObj.createConnection(Obj, function (modelObj) {
            var skip = Obj.skipValue ? Obj.skipValue : 0;
            var limit = Obj.limitValue ? Obj.limitValue : 0;
            var query = modelObj.find(Obj.query,{_id:0,__v:0}).skip(parseInt(skip)).limit(parseInt(limit));
            query.exec(function (err, data) {
                if (err) {
                    logger.error("getData");
                    return callback(AppConstants.ERROR.ERR_GET + err, null);
                }
                else {
                    logger.debug("getData");
                    return callback(null, data);
                }
            });
        });
    };

    DBModel.prototype.postData = function (Obj, callback) {

        logger.info("in postData");
        ConnectionObj.createConnection(Obj, function (modelObj) {
            Obj.dataToInsert = getDateDetails(Obj.dataToInsert,'post');
            var dataToInsert = new modelObj(Obj.dataToInsert);
            dataToInsert.save(function (err, result) {
                if (err) {
                    logger.error("postData");
                    return callback(AppConstants.ERROR.ERR_POST + err, null)
                }
                else {
                    logger.debug("postData");
                    var data = JSON.parse(JSON.stringify(result));
                    delete data._id;
                    delete data.__v;
                    return callback(null, data);
                }
            });
        });
    };

    DBModel.prototype.putData = function (Obj, callback) {

        logger.info("In putData");
        ConnectionObj.createConnection(Obj, function (modelObj) {
            Obj.dataToUpdate['$set'] = Obj.dataToUpdate['$set'] ? Obj.dataToUpdate['$set'] : {};
            Obj.dataToUpdate['$set'] = getDateDetails(Obj.dataToUpdate['$set'],'put');
            modelObj.update(Obj.query, Obj.dataToUpdate, Obj.options, function (err, data) {
                if (err) {
                    logger.error("In putData");
                    return callback(AppConstants.ERROR.ERR_UPDATE + err, null);
                }
                else {
                    logger.debug("In putData");
                    return callback(null, data);
                }
            });
        });
    };

    DBModel.prototype.getUniqueID = function (Obj, callback) {

        logger.debug("In getUniqueID");
        var uniqueIDObj = JSON.parse(JSON.stringify(Obj));
        var collName = uniqueIDObj.collectionName;
        uniqueIDObj.collectionName = "SEQUENCE_GENERATOR";
        ConnectionObj.createConnection(uniqueIDObj, function (modelObj) {
            modelObj.findOneAndUpdate({
                COLLECTION_NAME: collName,
                "ATTRIBUTE_NAME": Obj.uniqueID
            }, {$inc: {ATTRIBUTE_VALUE: 1}}, {new: true}, function (err, data) {
                if (err) {
                    logger.error("getUniqueID");
                    return callback(AppConstants.ERROR.ERR_UNIQUEID + err, null)
                }
                else {
                    logger.debug("getUniqueID");
                    return callback(null, data.ATTRIBUTE_VALUE);
                }
            });
        });
    };

    DBModel.prototype.postDataBulk = function (Obj, callBack) {

        logger.debug("In postDataBulk");
        ConnectionObj.getConnectionFromMongoose(Obj, function (err, DbConn) {
            if (err) {
                logger.error("postDataBulk-getConnectionFromMongoose");
                return callBack(err, null);
            } else {
                DbConn.collection(Obj.collectionName, function (err, collection) {
                    if (err) {
                        logger.error("postDataBulk-collection"+err);
                        return callBack(err, null);
                    } else {
                        var ordered;
                        if (Obj.ordered) {
                            ordered = collection.initializeOrderedBulkOp();
                        } else {
                            ordered = collection.initializeUnorderedBulkOp();
                        }
                        Obj.data.forEach(function(childObj){
                            ordered.insert(childObj);
                        });
                        ordered.execute(function(err,result){
                            if(err){
                                logger.error("postDataBulk-execute");
                                return callBack(err,null)
                            }else{
                                logger.debug("postDataBulk-execute");
                                return callBack(null,result)
                            }
                        });
                    }
                });
            }

        });
    };

    function getDateDetails(data,methodName){
        if(methodName === "post"){
            data['createdDate'] = Date.now();
            data['modifiedDate'] = Date.now();
        }else if(methodName === "put"){
            data['modifiedDate'] = Date.now();
        }
        return data;
    }

}


module.exports = DBModel;