/**
 * Created on 12/30/2016.
 */

var config = require("../../../Config/config.json");

var AppConstants = {
    "MAIL_SERVER_IPs": config.MAIL_SERVER_IPs,
    "FROM_ADDR": config.FROM_ADDR,
    "EMAIL_SUFFIX": config.EMAIL_SUFFIX,
    "ADMIN_DL":config.ADMIN_DL,
    "EMAIL_SUBJECT": {
        "ABSENCE_MARKER": "Leave Request",
        "PERFORMANCE_ISSUE": "Performance Issue"
    },
    "DISCUSS_WITH_VENDOR": "Discuss with vendor",
    "OFFBOARDED": "offboarded",
    "URL": config.URL,
    "ACCESS_KEY": config.ACCESS_KEY,
    "TOKEN_VALID_TIME": config.TOKEN_VALID_TIME,
    "AWF": "AWF",
    "PAYPAL_MANAGER": "PAYPAL_MANAGER",
    "VENDOR_MANAGER": "VENDOR_MANAGER",

    "DB": {
        "ABSENCE_MARKER": "AbsenceMarker",
        "VENDOR_LIST": "VendorList",
        "AWF_VENDOR_MAPPING": "AwfToVendorMapping",
        "AUTH_TOKEN": "AuthToken",
        "AUTHORIZATION": "Role",
        "INVALID_USER_ENTRIES": "InvalidUserLog",
        "PERFORMANCE_ISSUE": "PerformanceIssue"
    },
    "ERROR": {
        "NO_DESIGNATION": "Designation should be passed",
        "NO_TOKEN": "AuthToken should be passed",
        "NO_CORPID": "CorpID should be passed",
        "ERR_GET": "Error in fetching data from DB: ",
        "ERR_POST": "Error in inserting data to DB: ",
        "ERR_UPDATE": "Error in updating data to DB: ",
        "ERR_UNIQUEID": "Error in generating uniqueID: ",
        "ERR_MAIL": "Err in sending mail:  ",
        "ERR_NO_RESPONSE": "No Response from service: ",
        "AUTH_FAILURE": "Authentication Failed: ",
        "INVALID_USER": "Not a valid user",
        "USER_SESSION_EXPIRED": "User session expired",
        "USER_NOT_FOUND":"corpID Not Found",
        "NOT_AWF":"ID entered is not a valid AWF"
    }
};

module.exports = AppConstants;