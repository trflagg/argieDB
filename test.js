var assert = require('assert'),
	env = require('./environment-local'),
	Db = require('./db');

// Step 1 - Create Db object
(async function() {
var db = new Db(env);

await db.connect();

// Step 2 - Register model by requiring it
require('./model')(db);

// Step 3 - Create new object
var newModel = db.create('Model');

// Step 4 - Modify object
// ....
var objId = newModel.id();

try {
  // Step 5 - Save object
  await db.save('Model', newModel);

	// Step 6 - Look up object
  const foundModel = await db.load('Model', {'_id': objId});

  assert(foundModel.id().equals(objId));

  // Step 7 - Remove object
  await db.removeById('Model', String(objId));

  // Make multiple
  var model1 = db.create('Model');
  var model2 = db.create('Model');
  var id1 = model1.id();
  var id2 = model2.id();

  await db.save('Model', model1);
  await db.save('Model', model2);


  const foundModels = await db.loadMultiple('Model', {});
  assert(foundModels.length > 1);

  // delete all
  await db.deleteAll('Model');
  const foundModels2 = await db.loadMultiple('Model', {});
  assert(foundModels2.length < 1);


  // Step 8 - close db
	await db.close();

} catch (err) {
  console.log(err.stack);
}})();
