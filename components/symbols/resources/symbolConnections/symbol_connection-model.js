const db = require('../../../../data/dbConfig.js');

module.exports = {
  findBySymbol,
  findById,
  add,
  update,
  remove
};




function findBySymbol(id) {
  return db('symbol_connections')
  .leftJoin('symbols', 'symbol_connections.connected_symbol_id', 'symbols.symbol_id')
  .leftJoin('kinds', 'symbols.symbol_kind_id', 'kinds.kind_id')
  .select(
    'symbol_connection_id',
    'connection_symbol_id',
    'connection_description',
    'connection_strength',
    'connection_relationship',
    'symbol_id',
    'symbol_name',
    'symbol_kind_id',
    'symbol_description',
    'kind_name',
    'kind_id',
  )
  .where('main_symbol_id', id)
}

function findById(id) {
  return db('symbol_connections')
    .where( 'symbol_connection_id', id )
    .first();
}

function add(symbol_connection) {
  return db('symbol_connections')
    .insert(symbol_connection)
    .returning('symbol_connection_id')
    .then(res => {
      return findById(res[0])
    })
    .catch(err => {
      console.log(err)
      return err
    })
}

function update(changes, id) {
  return db('symbol_connections')
    .where('symbol_connection_id', id)
    .update(changes);
}

function remove(id) {
  return db('symbol_connections')
    .where( 'symbol_connection_id', id )
    .del();
}
