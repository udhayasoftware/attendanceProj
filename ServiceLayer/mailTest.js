var mail = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');

var mailTransport = mail.createTransport(smtpTransport({
    host: "10.184.198.24",
    secure: false,
    ignoreTLS: true,
    tls: {rejectUnauthorized: false}
}));

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'prajasekaran@paypal.com', // sender address
    to: 'prajasekaran@paypal.com', // list of receivers
    subject: 'Hello', // Subject line
    text: 'Hello world', // plaintext body
    html: '<b>Hello world</b>' // html body
};

// send mail with defined transport object
mailTransport.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
