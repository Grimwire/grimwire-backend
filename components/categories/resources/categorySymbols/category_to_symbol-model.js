const db = require('../../../../data/dbConfig.js');

module.exports = {
  findByCategory,
  findById,
  add,
  update,
  remove
};




function findByCategory(id) {
  return db('category_to_symbols')
  .leftJoin('symbols', 'category_to_symbols.cs_symbol_id', 'symbols.symbol_id')
  .select('category_symbol_id', 'cs_symbol_id', 'symbol_id', 'cs_description', 'symbol_name', 'symbol_description')
  .where('cs_category_id', id)
}

function findById(id) {
  return db('category_to_symbols')
    .where( 'category_symbol_id', id )
    .first();
}

function add(category_to_symbol) {
  return db('category_to_symbols')
    .insert(category_to_symbol)
    .returning('category_symbol_id')
    .then(res => {
      return findById(res[0])
    })
    .catch(err => {
      console.log(err)
      return err
    })
}

function update(changes, id) {
  return db('category_to_symbols')
    .where('category_symbol_id', id)
    .update(changes);
}

function remove(id) {
  return db('category_to_symbols')
    .where( 'category_symbol_id', id )
    .del();
}
