/**
 * Created on 12/19/2016.
 */

var mongoose = require("mongoose");

var config = require("../../Config/config.json");

var dbConnObj = {};
if(config.dbConfig.connectionServerOptions.reconnectTries === "MAX_VALUE"){
    config.dbConfig.connectionServerOptions['reconnectTries'] = Number.MAX_VALUE;
}

var optionsObj = {
    server: config.dbConfig.connectionServerOptions,
    db:config.dbConfig.connectionDBOptions
};
if(config.dbConfig.Authentication === "Y"){
    optionsObj['auth'] = {authdb: "admin"};
    optionsObj['user'] = config.dbConfig.userName;
    optionsObj['pass'] = config.dbConfig.Password;
}

var dbConnectionPool = mongoose.createConnection("mongodb://" + config.dbConfig.IP + ":" + config.dbConfig.Port + "/",optionsObj);
dbConnectionPool.on('error', function () {
    console.log("Error in connecting to Database" + new Date());
    throw("error in connecting to DB");
});
dbConnObj.admin = dbConnectionPool;

function Connection(){
    Connection.prototype.createConnection = function(Obj,callback){
        logger.info("In createConnection");
        var dbConn = dbConnectionPool.useDb(Obj.dbName);
        logger.debug("DBname " +Obj.dbName + "       collectionName " +Obj.collectionName);
        var Schema = mongoose.Schema;
        var schema = new Schema({"COLLECTION_NAME":"String","JSON_SCHEMA":"Object","OPTIONS":"Object"},{strict:"throw"});
        var schemaModel = dbConn.model("COLLECTION_JSON_SCHEMA",schema,"COLLECTION_JSON_SCHEMA");
        var schemaQuery = schemaModel.findOne({COLLECTION_NAME:Obj.collectionName});

        schemaQuery.exec(function(err,schema){
           if(err){
               logger.error("createConnection-fetchSchema");
               return callback(err,null);
           } else{
               logger.debug("createConnection-fetchSchema");
               var modelObj = dbConn.model(Obj.collectionName, new Schema(schema.JSON_SCHEMA), Obj.collectionName);
               return callback(modelObj);
           }
        });
    };

    Connection.prototype.getConnectionFromMongoose = function (Obj,callBack){
        if ((dbConnObj) && (dbConnObj[Obj.dbName])) {
            return callBack(null,dbConnObj[Obj.dbName].db);
        } else {
            dbConnObj[Obj.dbName] = dbConnObj.admin.useDb(Obj.dbName);
            return callBack(null,dbConnObj[Obj.dbName].db);
        }
    }
}


module.exports = Connection;