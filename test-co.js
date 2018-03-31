var assert = require('assert'),
    co = require('co'),
    env = require('./environment-local'),
    Db = require('./co-db');

co(function *() {
    // Step 1 - Create Db object
    var db = new Db(env);
    yield db.connect();

    // Step 2 - Register model by requiring it
    require('./model')(db);

    // Step 3 - Create new object
    var newModel = db.create('Model');

    // Step 4 - Modify object
    // ....
    var objId = newModel.id();

    try {
        // Step 5 - Save object
        // callback is optional
        yield db.save('Model', newModel);

        // Step 6 - Look up object
        var foundModel = yield db.load('Model', {'_id': objId})

        assert(foundModel.id().equals(objId));

        // Step 7 - remove object
        yield db.removeById('Model', String(objId));

        // Make multiple
        var model1 = db.create('Model');
        var model2 = db.create('Model');
        var id1 = model1.id();
        var id2 = model2.id();

        yield db.save('Model', model1);
        yield db.save('Model', model2);

        const foundModels = yield db.loadMultiple('Model', {});
        assert(foundModels.length > 1);

        // delete all
        yield db.deleteAll('Model');
        const foundModels2 = yield db.loadMultiple('Model', {});
        assert(foundModels2.length < 1);

        // Step 8 - close db
        db.close();
    } catch(e) {
        console.log('****Exception: ' + e);
    }
})();
