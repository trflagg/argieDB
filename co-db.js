var thunkify = require('thunkify')
    , util = require('util')
    , Db = require('./db');

module.exports = function() {

    myThunk = function(fn) {
      return function() {
        var args = new Array(arguments.length);
        var ctx = this;

        for(var i = 0; i < args.length; ++i) {
            args[i] = arguments[i];
        }

        return function(done){
          try {
            fn.apply(ctx, args).then(function(result) {
              return done(null, result);
            });
          } catch (e) {
            done(e);
          }
        }
      }
    };

    coDb = function(environment) {
        Db.call(this, environment);
    }
    util.inherits(coDb, Db);

    coDb.prototype.save = myThunk(Db.prototype.save);
    coDb.prototype.load = myThunk(Db.prototype.load);
    coDb.prototype.loadMultiple = myThunk(Db.prototype.loadMultiple);
    coDb.prototype.remove = myThunk(Db.prototype.remove);
    coDb.prototype.removeById = myThunk(Db.prototype.removeById);

    return coDb;
}()
