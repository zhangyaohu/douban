var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const crontab = require('crontab-node');
const eventEmitter = require('crontab-node/eventEmitter');

eventEmitter.on('crontab-node exit', () => {
	process.exit(0);
});
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var cp = require("child_process");
var cmdLine = "mysql -uroot -ppassword douban < douban.sql";
cp.exec(cmdLine, function(error,stdout,stderr) {
    console.log(error,stdout,stderr);
}); 
crontab('20 9 * * *', undefined, require('./scheduler/tv'));
crontab('25 9 * * *', undefined, require('./scheduler/movie'));
crontab('30 9 * * *', undefined, require('./scheduler/hoting'));
app.use('/', indexRouter);
app.use('/users', usersRouter);

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
module.exports = app;
