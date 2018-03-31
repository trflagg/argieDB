var mongo = require('mongoskin'),
    ObjectID = require('mongodb').ObjectID;


module.exports = function() {

    Db = function(environment) {
        this._environment = environment;
        this._db = mongo.db(environment.db.URL);

        if (!environment ||
            !environment.db ||
            !environment.db.URL) {
            throw "Problem with db environment"
        }
        // hide username:password in Mongo URL
        console.log('connecting to ' + environment.db.URL.replace(/:\/\/.*:(.*)@/, 'XXXXXXX'));
        this._models = {};
    };

    Db.prototype.close = function() {
        this._db.close();
    }

    Db.prototype.register = function(modelName, constructor) {
        this._models[modelName] = constructor;
    };

    Db.prototype.create = function(modelName) {
        var newModel = new this._models[modelName]();
        return newModel;
    };

    Db.prototype.save = function(modelName, model, callback) {
        if (this._models[modelName].prototype.onSave) {
            try {
                model = this._models[modelName].prototype.onSave(model);
            } catch(e) {
                if (callback) {
                    return callback(e, null);
                }
                else {
                    throw e;
                }
            }
        }

        if (callback) {
            // save to db
            this._db.collection(this.getCollectionName(modelName)).save(
                model,
                {upsert: true},
                callback
            );
        }
        else {
            // save to db
            this._db.collection(this.getCollectionName(modelName)).save(
                model,
                {upsert: true, w:0}
            );
        }
    };

    Db.prototype.load = function(modelName, condition, projection, callback) {
        // callback variable
        var db = this;

        // no projection supplied
        if (typeof(projection) === 'function') {
            callback = projection;
            projection = {};
        }

        // load from db
        this._db
        .collection(this.getCollectionName(modelName))
        .findOne(condition, projection, function(error, result) {
            if (error) {
                return callback(error, null);
            } else if (result == null) {
                var error = new Error(modelName + ' matching ' + JSON.stringify(condition) + ' not found.');
                error.name = "NotFoundError";
                return callback(error, null);
            }
            else try {
                var model = new db._models[modelName](result);
            } catch(e) {
                return callback(e, null);
            }
            return callback(null, model);
        });
    };

    Db.prototype.loadMultiple = function(modelName, condition, projection, callback) {
        // callback variable
        var db = this;

        // no projection supplied
        if (typeof(projection) === 'function') {
            callback = projection;
            projection = {};
        }

        // load from db
        this._db
        .collection(this.getCollectionName(modelName))
        .find(condition, projection)
        .toArray(function(err, results) {
            if (err) {
                return callback(err, null);
            }
            var objects = [];

            try {
                for (var i=0, ll=results.length; i<ll; i++) {
                    objects.push(new db._models[modelName](results[i]));
                }
            } catch(e) {
                return callback(e, null);
            }

            return callback(null, objects);
        });
    };

    Db.prototype.getCollectionName = function(modelName) {
        return modelName.toLowerCase();
    };

    Db.prototype.getConstructor = function(modelName) {
        return this._models[modelName];
    }

    Db.prototype.remove = function(modelName, condition, callback) {
        this._remove(modelName, condition, callback);
    }

    // could use mongoskin's collection.removeById()
    // but I like all of my code to go through the same place.
    Db.prototype.removeById = function(modelName, id, callback) {
        this._remove(modelName, {_id: new ObjectID(id)}, callback);
    };

    // co-db overwrites Db.prototype.remove so I need a separate method
    // for removeById() to call that doesn't get overwritten.
    Db.prototype._remove = function(modelName, condition, callback) {
        this._db.collection(this.getCollectionName(modelName))
            .remove(condition, callback);
    }

    Db.prototype.deleteAll = function(modelName) {
        this._db.collection(this.getCollectionName(modelName)).drop();
    }

    return Db;
}()
