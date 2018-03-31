var MongoClient = require('mongodb').MongoClient,
  ObjectID = require('mongodb').ObjectID;


module.exports = (function() {
    Db = function(environment) {
        //this._db = mongo.db(environment.db.URL);
        if (!environment ||
            !environment.db ||
            !environment.db.URL) {
            throw "Problem with db environment"
        }
        this._environment = environment;
        this._models = {};
    }

    Db.prototype.connect = async function() {
        try {
          const environment = this._environment;
          this._client = await MongoClient.connect(environment.db.URL);
          this._db = this._client.db('mis');
          // hide username:password in Mongo URL
          console.log('connecting to ' + environment.db.URL.replace(/:\/\/.*:(.*)@/, 'XXXXXXX'));
        } catch (err) {
          throw err;
        }
    };

    Db.prototype.close = async function() {
        await this._client.close();
    }

    Db.prototype.register = function(modelName, constructor) {
        this._models[modelName] = constructor;
    };

    Db.prototype.create = function(modelName) {
        var newModel = new this._models[modelName]();
        return newModel;
    };

    Db.prototype.checkConnection = async function() {
      if (!this._db) {
        await this.connect();
      }
    };

    Db.prototype.save = async function(modelName, model) {
        await this.checkConnection();

        if (this._models[modelName].prototype.onSave) {
            try {
                model = this._models[modelName].prototype.onSave(model);
            } catch(e) {
                throw e;
            }
        }

        // save to db
      try {
        await this._db.collection(this.getCollectionName(modelName)).save(
            model,
        );
      } catch (e) {
        throw e;
      }
    };

    Db.prototype.load = async function(modelName, condition, projection) {
        await this.checkConnection();

        // callback variable
        var db = this;

        // no projection supplied
        if (typeof(projection) === 'function') {
            callback = projection;
            projection = {};
        }

        // load from db
        try {
          const result = await this._db
          .collection(this.getCollectionName(modelName))
          .findOne(condition, projection);

          if (!result) {
            var error = new Error(modelName + ' matching ' + JSON.stringify(condition) + ' not found.');
            error.name = "NotFoundError";
            throw error;
          }

          var model = new db._models[modelName](result);
          return model;
        } catch (err) {
          throw err;
        }
    };

    Db.prototype.loadMultiple = async function(modelName, condition, projection) {
        await this.checkConnection();

        // callback variable
        var db = this;

        // no projection supplied
        if (typeof(projection) === 'function') {
            callback = projection;
            projection = {};
        }

        // load from db
        try {
          const results = await this._db
          .collection(this.getCollectionName(modelName))
          .find(condition, projection)
          .toArray();

          var objects = [];
          for (var i=0, ll=results.length; i<ll; i++) {
              objects.push(new db._models[modelName](results[i]));
          }
          return objects;
        } catch (e) {
          throw e;
        }
    };

    Db.prototype.getCollectionName = function(modelName) {
        return modelName.toLowerCase();
    };

    Db.prototype.getConstructor = function(modelName) {
        return this._models[modelName];
    }

    Db.prototype.remove = async function(modelName, condition) {
        await this._remove(modelName, condition);
    }

    // could use mongoskin's collection.removeById()
    // but I like all of my code to go through the same place.
    Db.prototype.removeById = async function(modelName, id) {
        await this._remove(modelName, {_id: new ObjectID(id)});
    };

    // co-db overwrites Db.prototype.remove so I need a separate method
    // for removeById() to call that doesn't get overwritten.
    Db.prototype._remove = async function(modelName, condition) {
        await this.checkConnection();

        await this._db.collection(this.getCollectionName(modelName))
            .remove(condition);
    }

    Db.prototype.deleteAll = async function(modelName) {
        await this.checkConnection();

        await this._db.collection(this.getCollectionName(modelName)).drop();
    }

    return Db;
})()
