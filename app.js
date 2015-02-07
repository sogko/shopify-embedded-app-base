//process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

'use strict';

var express = require('express');
var path = require('path');
var nconf = require('nconf');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var errorHandler = require('express-error-handler');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');

var https = require('https');

var fs = require('fs');


//load settings from environment config
nconf.argv().env().file({
  file: './settings/' + (process.env.NODE_ENV || 'dev') + '.json'
});
exports.nconf = nconf;

//configure express
var app = express();

app.set('env', nconf.get('NODE_ENV') || 'dev');

//log all requests
app.use(logger('dev'));

//support json and url encoded requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//setup encrypted session cookies
app.use(cookieParser());
app.use(session({
  secret: nconf.get('server:session_secret'),
  saveUninitialized: true,
  resave: true,
  cookie: {secure: true}
}));

//statically serve from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

//use handlebars templating engine for view rendering
var hbs = handlebars({});
app.engine('.hbs', handlebars({
  extname: '.hbs',
  defaultLayout: 'main'
}));
app.set('view engine', '.hbs');

//use the environment's port(s) if specified
app.set('port', process.env.PORT || nconf.get('server:port') || 3443);

// setup routes
var routes = {
  index: require('./routes/index'),
  app: require('./routes/app'),
  auth: require('./routes/auth')
};
app.use('/', routes.index);
app.use('/auth', routes.auth);
app.use('/app', routes.app);


// error handlers
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// Create an HTTP service.

// Create an HTTPS service identical to the HTTP service.
var options = {
  key: fs.readFileSync(nconf.get('server:ssl_key_path')),
  cert: fs.readFileSync(nconf.get('server:ssl_cert_path')),
  checkServerIdentity: function () {
    return true;
  }
};
var server = https.createServer(options, app).listen(app.get('port'));

app.use(errorHandler({
  views: {
    default: 'error'
  },
  server: server
}));

server.listen(app.get('port'), function () {
  console.log('Listening on port ' + app.get('port'));
});
