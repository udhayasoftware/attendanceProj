"use strict";

var mail = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');


function EMailNotification() {

    EMailNotification.prototype.constructMailOptions = function(Obj,callBack){
        console.log(JSON.stringify(Obj))
        var resMailObj = {};
        resMailObj.fromAddr = AppConstants.FROM_ADDR;
        resMailObj.toAddr = AppConstants.FROM_ADDR;
        //resMailObj.toAddr = getToAddrDetails(Obj);
        //resMailObj.ccAddr = getCCAddrDetails(Obj);
        resMailObj.msgSubject = getSubject(Obj);
        var messageBody = getMsgDetails(Obj);
        var finalMsgBody = messageBody.toString();
        resMailObj.messageBody = finalMsgBody;

        console.log("***********")
        console.log(JSON.stringify(resMailObj));
        sendEmail(resMailObj,function (err,data) {
            if(err){
                logger.error("constructMailOptions");
                return callBack(AppConstants.ERROR.ERR_MAIL + err, null);
            } else{
                return callBack(null, data);
            }
        });
    };

    function sendEmail(mailObj, callBack) {
        logger.debug("In sendEmail");
        var counter = 0;
        checkServerAndsend();
        function checkServerAndsend() {
            console.log("in chkServer-counter value =  " + counter);
            if (counter !== AppConstants.MAIL_SERVER_IPs.length) {
                var mailTransport = mail.createTransport(smtpTransport({
                    host: AppConstants.MAIL_SERVER_IPs[counter],
                    secure: false,
                    ignoreTLS: true,
                    tls: {rejectUnauthorized: false}
                }));
                var mailOptions = {
                    from: mailObj.fromAddr, // sender address
                    to: mailObj.toAddr, // list of receivers
                    cc: mailObj.ccAddr, // list of receivers
                    subject: mailObj.msgSubject, // Subject line
                    html: mailObj.messageBody // html body
                };

                // send mail with defined transport object
                mailTransport.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        logger.error("Error in sending mail");
                        counter++;
                        checkServerAndsend();
                    } else {
                        logger.info('Message sent: ' + info.response);
                        return callBack(null, info);
                    }
                    //mailTransport.close();
                });
            }
        }
    }

    function getToAddrDetails(Obj){

        var toAddrDetail;
        console.log("Objjjj")
        console.log(JSON.stringify(Obj))
        if(Obj.moduleName === AppConstants.DB.ABSENCE_MARKER){
            //If AWF / Vendor Manager raises/modifies a leave request , to address should be PayPal Manager
            if((Obj.designation === "AWF") || (Obj.designation === "VENDOR_MANAGER")){
                var managerID = (Obj.data.managerName).match(/\((.*?)\)/);
                toAddrDetail =  managerID[1] + AppConstants.EMAIL_SUFFIX;
                //If PayPal Manager raises/modifies a leave request , to address should be Vendor Manager
            }else if(Obj.designation === "PAYPAL_MANAGER"){
                var vendorManagerID = Obj.data.vendorManagerID;
                toAddrDetail = (vendorManagerID) + AppConstants.EMAIL_SUFFIX;
            }
        }
        else if(Obj.moduleName === AppConstants.DB.PERFORMANCE_ISSUE){
            toAddrDetail = AppConstants.ADMIN_DL + AppConstants.EMAIL_SUFFIX;
        }

        return toAddrDetail;

    }

    function getCCAddrDetails(Obj){

        var ccAddrDetail;
        if(Obj.moduleName === AppConstants.DB.ABSENCE_MARKER){
            //If AWF  raises/modifies a leave request , cc address should be Vendor Manager
            if(Obj.designation === "AWF"){
                var vendorManagerID = Obj.data.vendorManagerID;
                ccAddrDetail = (vendorManagerID) + AppConstants.EMAIL_SUFFIX;
                //If PayPal Manager / Vendor Manager raises/modifies a leave request , cc address should be AWF
            }else if((Obj.designation === "PAYPAL_MANAGER") || (Obj.designation === "VENDOR_MANAGER")){
                ccAddrDetail = Obj.data.paypalID + AppConstants.EMAIL_SUFFIX;
            }
        }
        else if(Obj.moduleName === AppConstants.DB.PERFORMANCE_ISSUE){
            ccAddrDetail = (Obj.data.vendorManagerID) + AppConstants.EMAIL_SUFFIX;
        }

        return ccAddrDetail;

    }

    function getSubject(Obj){

        var mailSubject;
        if(Obj.moduleName === AppConstants.DB.ABSENCE_MARKER){
            // Change of subject in accordance with mark Absence / update Absence
            if(Obj.methodName === "POST"){
                mailSubject = AppConstants.EMAIL_SUBJECT.ABSENCE_MARKER + " Notification (Request ID : " + Obj.data.displayID + ")";
            }
            if(Obj.methodName === "PUT"){
                mailSubject = AppConstants.EMAIL_SUBJECT.ABSENCE_MARKER + " Modification (Request ID : " + Obj.data.displayID + ")";
            }
        }
        else if(Obj.moduleName === AppConstants.DB.PERFORMANCE_ISSUE){
            if(Obj.methodName === "POST"){
                mailSubject = AppConstants.EMAIL_SUBJECT.PERFORMANCE_ISSUE + " Notification (Request ID : " + Obj.data.displayID + ")";
            }
            if(Obj.methodName === "PUT"){
                mailSubject = AppConstants.EMAIL_SUBJECT.PERFORMANCE_ISSUE + " Modification (Request ID : " + Obj.data.displayID + ")";
            }
        }

        return mailSubject;
    }

    function getMsgDetails(Obj){

        var msgBody;
        if(Obj.moduleName === AppConstants.DB.ABSENCE_MARKER){
            if(Obj.data.status === AppConstants.DISCUSS_WITH_VENDOR){
                msgBody = "<p> Dear recipient, <br>   A Leave Request is to be discussed with vendor for " + Obj.data.paypalID + ". Please take a moment to view the request details \n </p> <br> ";
            }else{
                msgBody = "<p> Dear recipient, <br>   A Leave Request has been " + Obj.data.status +  " for " + Obj.data.paypalID + ". Please take a moment to view the request details \n </p> <br> ";
            }
            msgBody += "<table width=\"70%\" cellpadding=2 cellspacing=2 border=1 align=\"centre\">\n";
            msgBody += "<tr bgcolor=\"#f2f2f2\">\n";
            msgBody += "<th> PayPal ID </th>\n";
            msgBody += "<th> AWF Name</th>\n";
            msgBody += "<th> Vendor Name</th>\n";
            msgBody += "<th> Leave From </th>\n";
            msgBody += "<th> Leave To </th>\n";
            msgBody += "<th> Raised Date</th>\n";
            msgBody += "</tr>\n";
            msgBody += "<tr>\n";
            msgBody += "<td width=\"15%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + Obj.data.paypalID + "</td>\n";
            msgBody += "<td width=\"15%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + Obj.data.awfName + "\n";
            msgBody += "<td width=\"15%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + Obj.data.vendorName + "\n";
            msgBody += "<td width=\"20%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + formatDate(Obj.data.leaveFrom) + "\n";
            msgBody += "<td width=\"20%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + formatDate(Obj.data.leaveTo) + "\n";
            msgBody += "<td width=\"20%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + formatDate(Obj.data.createdDate) + "\n";
            msgBody += "</tr>\n";
            msgBody += "</table>\n";
            msgBody += "<br>\n";
            msgBody += "<p> Please <a href = " + AppConstants.URL +" > click here </a>  to edit / delete the request  </p>\n";
            msgBody += "<br><br>\n";
            msgBody += "<p> Regards, <br> Tech Outsource Team </p>\n";
            msgBody += ""
        }
        else if(Obj.moduleName === AppConstants.DB.PERFORMANCE_ISSUE){

            if(Obj.data.resolutionStatus === AppConstants.OFFBOARDED){
                msgBody = "<p> Dear recipient, <br>  "  + Obj.data.awfName + " (" + Obj.data.paypalID + ") " + " has been offboarded due to Performance Issue. Please take a moment to view the details \n </p> <br> ";
                msgBody += "<table width=\"80%\" cellpadding=2 cellspacing=2 border=1 align=\"centre\">\n";
            }
            else{
                msgBody = "<p> Dear recipient, <br>   A Performance Issue has been " + Obj.data.resolutionStatus +  " for " + Obj.data.paypalID + ". Please take a moment to view the details \n </p> <br> ";
                msgBody += "<table width=\"70%\" cellpadding=2 cellspacing=2 border=1 align=\"centre\">\n";
            }

            msgBody += "<tr bgcolor=\"#f2f2f2\">\n";
            msgBody += "<th> PayPal ID </th>\n";
            msgBody += "<th> AWF Name</th>\n";
            msgBody += "<th> Vendor Name</th>\n";
            msgBody += "<th> Resolution Status </th>\n";
            msgBody += "<th> Raised Date</th>\n";
            if(Obj.data.resolutionStatus === AppConstants.OFFBOARDED){
                msgBody += "<th> OffBoarded Date</th>\n";
            }
            msgBody += "</tr>\n";
            msgBody += "<tr>\n";
            msgBody += "<td width=\"15%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + Obj.data.paypalID + "</td>\n";
            msgBody += "<td width=\"15%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + Obj.data.awfName + "\n";
            msgBody += "<td width=\"15%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + Obj.data.vendorName + "\n";
            msgBody += "<td width=\"20%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + Obj.data.resolutionStatus + "\n";
            msgBody += "<td width=\"20%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + formatDate(Obj.data.createdDate) + "\n";
            if(Obj.data.resolutionStatus === AppConstants.OFFBOARDED){
                msgBody += "<td width=\"20%\" style=\"font-family: verdana, arial, helvetica;font-size: 13px;color: #000000;text-align:center\">" + formatDate(Obj.data.offBoardedDate) + "\n";
            }
            msgBody += "</tr>\n";
            msgBody += "</table>\n";
            msgBody += "<br>\n";
            msgBody += "<p> Please <a href = " + AppConstants.URL +" > click here </a>  to edit / delete the request  </p>\n";
            msgBody += "<br><br>\n";
            msgBody += "<p> Regards, <br> Tech Outsource Team </p>\n";
            msgBody += ""
        }

        return msgBody;
    }

    function formatDate(dateString){

        dateString=new Date(dateString).toUTCString();
        dateString=dateString.split(' ').slice(0, 4).join(' ');
        return dateString;
    }
}


module.exports = EMailNotification;