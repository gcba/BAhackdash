
/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(express)
  , config = require('./config.json')
  , http = require('http');

/*
 * DB
 */

mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));

var app = exports.app = express();

/*
 * Application config
 */

app.configure(function(){
  app.set('config', config);
  app.set('port', process.env.OPENSHIFT_NODEJS_PORT || app.get('config').port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.limit('3.5mb'));
  app.use(express.methodOverride());
  app.use(express.cookieParser(app.get('config').session));
  app.use(express.session({
      secret: app.get('config').session
    , store: new MongoStore({
        db: "session", 
    }) 
    , cookie: { maxAge: 365 * 24 * 60 * 60 * 1000, path: '/', domain: '.' + app.get('config').host }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.set('statuses',['Analisis de datos','Diseño Industrial','Apps y Sensores','Visualización de datos']);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
 * Models
 */

require('./models')(app);

/*
 * Auth
 */

require('./auth')(app);

/*
 * Routes
 */

require('./routes')(app);

module.exports = http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function(err){
  console.log(err);
});
