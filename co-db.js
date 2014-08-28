var thunkify = require('thunkify')
    , util = require('util')
    , Db = require('./db');

module.exports = function() {

    coDb = function(environment) {
        Db.call(this, environment);
    }
    util.inherits(coDb, Db);

    coDb.prototype.save = thunkify(Db.prototype.save);
    coDb.prototype.load = thunkify(Db.prototype.load);
    coDb.prototype.loadMultiple = thunkify(Db.prototype.loadMultiple);
    coDb.prototype.remove = thunkify(Db.prototype.remove);

    return coDb;
}()
