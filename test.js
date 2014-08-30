var assert = require('assert'),
	env = require('./environment-local'),
	Db = require('./db');

// Step 1 - Create Db object
var db = new Db(env);

// Step 2 - Register model by requiring it
require('./model')(db);

// Step 3 - Create new object
var newModel = db.create('Model');

// Step 4 - Modify object
// ....
var objId = newModel.id();

// Step 5 - Save object
// callback is optional
db.save('Model', newModel, function(err) {
	if (err !== null) {
		console.log('error: ' + err);
	}

	// Step 6 - Look up object
	db.load('Model', {'_id': objId}, function(err, foundModel) {
		if (err !== null) {
			console.log('error: ' + err);
		}
		assert(foundModel.id().equals(objId));

		// Step 7 - Remove object
		db.removeById('Model', String(objId), function(err) {
			if (err !== null) {
				console.log('error: ' + err);
			}
			// Step 8 - close db
			db.close();
		});
	});
});
