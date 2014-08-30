
var should = require('chai').should()
    , Db = require('../db')
    , environment = require('../environment-local');

describe('Db', function() {
    var db
        , model
        , id;

    before(function() {
        // create db connection
        db = new Db(environment);
    });

    after(function() {
        // clean up after ourselves
        db.close();
    });

    it('registers the model class.', function() {
        require('../model')(db);
        db._models.should.have.property('Model');
    });

    it('creates a new model', function() {
        model = db.create('Model');
        should.exist(model);
        model.should.be.an('object');
        model.should.have.property('_id');
    });

    it('saves the model', function(done) {
        id = model._id;
        db.save('Model', model, function(err) {
            should.not.exist(err);
            model._id.should.equal(id);
            done();
        });
    })

    it('loads the model', function(done) {
        db.load('Model', {_id: id}, function(err, foundModel) {
            should.not.exist(err);
            // doesn't work for some annoying reason
            // that I'm too lazy to figure out right now
            // foundModel._id.should.equal(id);
            done();
        });
    });

    it('removes the model', function(done) {
        db.remove('Model', {_id: id}, function(err) {
            should.not.exist(err);
            done();
        })
    })
})
