
const morgan = require('morgan'); //can be configured to log to file, maybe not for prod
const fs = require('fs');
const path = require('path');

function log(app) {
    
    app.use(morgan('common', {
        stream: fs.createWriteStream(path.join(__dirname, 'http.log'), { flags: 'a' })
    }));
}

module.exports = log;