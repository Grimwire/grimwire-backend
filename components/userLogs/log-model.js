const db = require('../../data/dbConfig.js');

module.exports = {
  find,
  findUnconfirmed,
  findById,
  confirmAll,
  add,
  update,
  remove,
  removeAll
};



function findUnconfirmed() {
  return db('logs')
  .select('logs.*', 'submitter.username AS submitter_username')
  .leftJoin('users as submitter', 'logs.log_submitting_user_id', 'submitter.user_id')
  .whereNull('log_confirmed')
  .limit(50)
}

function find() {
  return db('logs')
  .select('logs.*', 'submitter.username AS submitter_username', 'confirmer.username AS confirmer_username')
  .leftJoin('users as submitter', 'logs.log_submitting_user_id', 'submitter.user_id')
  .leftJoin('users as confirmer', 'logs.log_confirming_user_id', 'confirmer.user_id')
  .limit(50)
}

function confirmAll() {
  return db('logs')
  .whereNull('log_confirmed')
  .update('log_confirmed', true)
}

function findById(id) {
  return db('logs')
    .where( 'log_id', id )
    .first();
}

function add(log) {
  return db('logs')
    .insert(log)
    .returning('log_id')
    .then(res => {
      return findById(res[0])
    })
}

function update(changes, id) {
  return db('logs')
    .where('log_id', id)
    .update(changes)
    .returning('log_id')
    .then(res => {
      return findById(res[0])
    })
}

function remove(id) {
  return db('logs')
    .where( 'log_id', id )
    .del();
}

function removeAll() {
  return db('logs').del();
}
