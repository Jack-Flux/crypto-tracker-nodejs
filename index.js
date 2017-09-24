const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const EventEmitter = require('events');
const config = require('./config.json');
const db = require('./lib/config/db');

const app = express();
const events = new EventEmitter();
events.setMaxListeners(0);
const User = db.model('User');

require('./lib/config/passportSetup')(passport, User);

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'ejs'); // allows the use of EJS as the frontend template language
app.use(express.static(`${__dirname}/public`)); // expresses all content in the public folder to the client
app.use(cookieParser());
app.use(bodyParser());

app.use(session({ secret: 'testing123' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

require('./lib/routes')(app, passport); // sets app routing
require('./lib/sockets')(io, events); // handles server sockets
require('./lib/apiCalls')(events); // handles all api calls

server.listen(config.port); // starts the server on config port
