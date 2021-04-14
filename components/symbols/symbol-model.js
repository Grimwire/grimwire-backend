const db = require('../../data/dbConfig.js');

module.exports = {
  find,
  listOfNames,
  findRelatedNames,
  findById,
  findByName,
  findKind,
  findKindConnections,
  add,
  update,
  remove
};



function find(sort, sortdir, searchTerm) {
  return db('symbols')
  .orderBy(sort, sortdir)
  .leftJoin('kinds', 'symbols.symbol_kind_id', 'kinds.kind_id')
  .where("symbol_name", 'iLIKE', `%${searchTerm}%`)
}


function listOfNames() {
  return db('symbols')
  .select('symbol_name', 'symbol_id')
}

function findRelatedNames(name, id) {
  //We are just passing in the name of the symbol. 
  //Since the convention is "${name} (${kind})", we'll split by ' (' and artificially add a space, 
  //do a case-sensitive search for that.
  //This may narrow results, but will avoid edge cases like a title called "Az" returning a bunch extra things.
  const searchTerm = name.split(' (')[0] + " "
  return db('symbols')
  .leftJoin('kinds', 'symbols.symbol_kind_id', 'kinds.kind_id')
  .where("symbol_name", 'LIKE', `%${searchTerm}%`)
  .andWhereNot('symbol_id', id)
  .select('symbol_id', 'symbol_name', 'kind_id', 'kind_name')

}

function findByName(name, excludingId = null) {
  if(excludingId) {
    return db('symbols')
    .where('symbol_name', name)
    .whereNot('symbol_id', excludingId)
    .first()
  } else {
    return db('symbols')
    .where('symbol_name', name)
    .first()
  }
}

function findById(id) {
  return db('symbols')
    .where( 'symbol_id', id )
    .first();
}

function findKind(kind_id) {
  return db('kinds')
  .select('kind_id', 'kind_name', 'kind_description', 'specific_order', 'default_extra_info')
  .where('kind_id', kind_id).first()
}

function findKindConnections(id) {
  return db('kind_symbol_connections')
  .leftJoin('kinds', 'kinds.kind_id', 'kind_symbol_connections.ksc_kind_id')
  .select('kind_symbol_connection_id', 'ksc_kind_id', 
    'kind_id',  'kind_name')
  .where('ksc_symbol_id', id)
}

function add(symbol) {
  return db('symbols')
    .insert(symbol)
    .returning('symbol_id')
    .then(res => {
      return findById(res[0])
    })
}

function update(changes, id) {
  return db('symbols')
    .where('symbol_id', id)
    .update(changes);
}

function remove(id) {
  return db('symbols')
    .where( 'symbol_id', id )
    .del();
}
