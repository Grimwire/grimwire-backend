const db = require('../../data/dbConfig.js');

module.exports = {
  find,
  listOfNames,
  findById,
  findByName,
  getCreatedKinds,
  getUsesKinds,
  add,
  update,
  remove,
};



function find(sort, sortdir, searchTerm) {
  return db('pantheons')
  .orderBy(sort, sortdir)
  .where('pantheon_name', 'iLIKE', `%${searchTerm}%`)
}

function listOfNames() {
  return db('pantheons')
  .select('pantheon_name', 'pantheon_id')
}

function findById(id) {
  return db('pantheons')
    .where( 'pantheon_id', id )
    .first();
}

function findByName(name, excludingId = null) {
  if(excludingId) {
    return db('pantheons')
    .where('pantheon_name', name)
    .whereNot('pantheon_id', excludingId)
    .first()
  } else {
    return db('pantheons')
    .where('pantheon_name', name)
    .first()
  }
}

function getCreatedKinds(id) {
  return db('kinds')
  .where('creator_pantheon_id', id)
}

function getUsesKinds(id) {
  return db('kinds_to_pantheons')
  .join('kinds', 'kinds_to_pantheons.kp_kind_id', 'kinds.kind_id')
  .where('kp_pantheon_id', id)
}

function add(pantheon) {
  return db('pantheons')
    .insert(pantheon)
    .returning('pantheon_id')
    .then(res => {
      return findById(res[0])
    })
}

function update(changes, id) {
  return db('pantheons')
    .where('pantheon_id', id)
    .update(changes);
}

function remove(id) {
  return db('pantheons')
    .where( 'pantheon_id', id )
    .del();
}
