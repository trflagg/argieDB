
var should = require('chai').should()
    , Db = require('../co-db')
    , environment = require('../environment-local');

describe('coDb', function() {
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

    it('saves the model', function*() {
        id = model._id;
        yield db.save('Model', model);
        should.not.exist(err);
        model._id.should.equal(id);
    })

    it('loads the model', function*() {
        found_model = yield db.load('Model', {_id: id});
        should.not.exist(err);
        found_model._id.should.equal(model._id);
    });

    it('removes the model', function*() {
        yield db.remove('Model', {_id: id});
        should.not.exist(err);
    })
})
