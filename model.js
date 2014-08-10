module.exports = function(db) {
    var ObjectID = require('mongodb').ObjectID;

    // not sure what to do with this yet.
    Model = function(doc) {
        if (doc) {
            this._id = doc._id;
            this.loadFromDoc(doc);
        }
        else {
            this._id = new ObjectID();
            this.initialize();
        }
    }

    Model.prototype.onSave = function(model) {
        var doc = {};

        model.validate.call(model);

        doc._id = model._id;
        model.saveToDoc.call(model, doc);

        return doc;
    }

    Model.prototype.loadFromDoc = function(doc) {

    };

    Model.prototype.initialize = function() {

    };

    Model.prototype.saveToDoc = function(doc) {

    };

    Model.prototype.validate = function() {
        // if invalid:
        // throw 'Reason why'
    };

    Model.prototype.id = function() {
        return this._id;
    }

    db.register('Model', Model);
    return Model;
}
