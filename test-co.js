var assert = require('assert'),
    co = require('co'),
    env = require('./environment-local'),
    Db = require('./co-db');

co(function *() {
    // Step 1 - Create Db object
    var db = new Db(env);

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

        // Step 7 - close db
        db.close();
    } catch(e) {
        console.log('****Exception: ' + e);
    }
})();
