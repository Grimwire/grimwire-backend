const db = require('../../../../data/dbConfig.js');

module.exports = {
  findHistories,
  findInfluenced,
  findById,
  add,
  update,
  remove,
  removeHistoriesByPantheons
};




//Returns an array of simple pantheon objects based on the provided id. Only returns short fields, no longtext fields.
function findHistories(id) {
  return db('pantheons_history')
  .select('pantheon_history_id', 
  'influenced_id', 
  'influencer_id', 
  'history_type',
  'pantheon_id', 
  'pantheon_name', 
  'pantheon_description', 
  'start_year', 
  'end_year')
  .join('pantheons', 'pantheons_history.influencer_id', 'pantheons.pantheon_id')
  .where('influenced_id', id)
}

//Returns an array of simple pantheon objects based on the provided id. Only returns short fields, no longtext fields.
function findInfluenced(id) {
  return db('pantheons_history')
  .select('pantheon_history_id', 'influenced_id', 'influencer_id', 'history_type', 'pantheon_id', 'pantheon_name', 'pantheon_description', 'start_year', 'end_year')
  .join('pantheons', 'pantheons_history.influenced_id', 'pantheons.pantheon_id')
  .where('influencer_id', id)
}


function findById(id) {
  return db('pantheons_history')
    .where( 'pantheon_history_id', id )
    .first();
}

function add(kind_to_pantheon) {
  return db('pantheons_history')
    .insert(kind_to_pantheon)
    .returning('pantheon_history_id')
    .then(res => {
      return findById(res[0])
    })
    .catch(err => {
      console.log(err)
      return err
    })
}

function update(changes, id) {
  return db('pantheons_history')
    .where('pantheon_history_id', id)
    .update(changes);
}

function remove(id) {
  return db('pantheons_history')
    .where( 'pantheon_history_id', id )
    .del();
}

function removeHistoriesByPantheons(id){
  return db('pantheons_history')
    .where('influenced_id', id)
    .orWhere('influencer_id', id)
    .del();
}
