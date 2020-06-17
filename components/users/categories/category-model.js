const db = require('../../../data/dbConfig.js');

module.exports = {
  find,
  listOfNames,
  findById,
  findByName,
  add,
  update,
  remove,
};

function find(sort, sortdir, searchTerm) {
  return db('categories')
  .orderBy(sort, sortdir)
  .where('category_name', 'iLIKE', `%${searchTerm}%`)
}

function listOfNames() {
  return db('categories')
  .select('category_name', 'category_id')
}

function findById(id) {
  return db('categories')
    .where( 'category_id', id )
    .first();
}

function findByName(name, excludingId = null) {
  if(excludingId) {
    return db('categories')
    .where('category_name', name)
    .whereNot('category_id', excludingId)
    .first()
  } else {
    return db('categories')
    .where('category_name', name)
    .first()
  }
}

function add(category) {
  return db('categories')
    .insert(category)
    .returning('category_id')
    .then(res => {
      return findById(res[0])
    })
}

function update(changes, id) {
  return db('categories')
    .where('category_id', id)
    .update(changes);
}

function remove(id) {
  return db('categories')
    .where( 'category_id', id )
    .del();
}
