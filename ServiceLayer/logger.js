var winston = require('winston');
var config = require("../Config/config.json");

var customLevels = {
    levels: {
        debug: 3,
        info: 3,
        warn: 1,
        error: 0
    },
    colors: {
        debug: 'blue',
        info: 'green',
        warn: 'yellow',
        error: 'red'
    }
};

GLOBAL.logger = new (winston.Logger)({
    level: config.logLevel,
    levels: customLevels.levels,
    transports: [
        // setup console logging
        new(winston.transports.Console)({
            level: config.logLevel,
            levels: customLevels.levels,
            colorize: true
        }),
        // setup logging to file
        new(winston.transports.File)({
            filename: './output.log',
            maxsize: 1024 * 1024 * 10, // 10MB
            level: config.logLevel,
            levels: customLevels.levels
        })
    ]
});



