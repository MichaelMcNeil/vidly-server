const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const startupDebugger = require('debug')('app:startup');
const config = require("config");
const helmet = require('helmet');
const logger = require('./logger');

//Routes
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const home = require('./routes/home')
const rentals = require('./routes/rentals');
const users = require('./routes/users');
const auth = require('./routes/auth');

//Application
const express = require('express');
const app = express();

//Database Connection
mongoose.connect('mongodb://localhost/vidly')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB', err));

//Express Settings
app.set('view engine', 'pug');
app.set('views', './views');

//Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(helmet());
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/', home);

//Configuration
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server: ' + config.get('mail.host'));
if(!config.get('jwtPrivateKey')){
    console.log('FATAL ERROR: jwtPrivateKey not defined.');
    process.exit(1);
}
//console.log('Mail Password: ' + config.get('mail.password'));

if (app.get('env') === 'development') {
    logger(app);
    startupDebugger('Morgan Initiated...');
};

//Initialize Server
const port = process.env.port || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

