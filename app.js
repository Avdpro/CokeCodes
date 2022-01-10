var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var MongoDB= require('./util/mongo');
var envCfg=null;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var wsRouter=require('./routes/ws');

var app = express();

app.initCokeCodesApp=async function(){
	let mongoDB,mongoURL;

	envCfg=app.get("env");
	mongoURL=app.get("mongoURL")||"mongodb://127.0.0.1:20000";
	console.log("Application env: "+envCfg);
	// view engine setup
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'pug');

	app.use(logger('dev'));
	app.use(express.json({limit: '50mb'}));
	app.use(express.urlencoded({limit: '50mb', extended: false }));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));

	mongoDB=new MongoDB(this, mongoURL);
	app.set('MongoDB',mongoDB);
	await mongoDB.initDB();
	app.set('DBUser',mongoDB.collection("cokecodes","users"));
	app.set('DBDisk',mongoDB.collection("cokecodes","disks"));
	app.set('DBSys',mongoDB.collection("cokecodes","sys"));
	app.set('DBPkg',mongoDB.collection("cokecodes","pkg"));

	//Only in dev mode:
	if(envCfg==="dev") {
		app.use('/jaxweb', express.static(path.join(__dirname, 'jaxweb')));
	}

	app.use('/', indexRouter);
	app.use('/users', usersRouter);
	app.use('/ws', wsRouter(app));

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		next(createError(404));
	});

	// error handler
	app.use(function(err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};

		// render the error page
		res.status(err.status || 500);
		res.render('error');
	});
};


module.exports = app;
