const db = require('../../data/dbConfig.js');

module.exports = {
  find,
  listOfNames,
  findById,
  findByName,
  getSymbols,
  getCategories,
  add,
  update,
  remove
};



function find(sort, sortdir, searchTerm) {
  return db('kinds')
  .orderBy(sort, sortdir)
  .where('kind_name', 'iLIKE', `%${searchTerm}%`)
  
}

function listOfNames() {
  return db('kinds')
  .select('kind_name', 'kind_id')
}

function findById(id) {
  return db('kinds')
    .join('pantheons', 'pantheon_id', '=', 'creator_pantheon_id')
    .select('kinds.*', 'pantheon_id', 'pantheon_name', 'pantheon_description')
    .where( 'kind_id', id )
    .first();
}

function findByName(name, excludingId = null) {
  if(excludingId) {
    return db('kinds')
    .where('kind_name', name)
    .whereNot('kind_id', excludingId)
    .first()
  } else {
    return db('kinds')
    .where('kind_name', name)
    .first()
  }
}

async function getSymbols(id, kindInfoKinds) {
  const symbols = await db('symbols')
  .select('symbol_name', 'symbol_id', 'symbol_description', 'symbol_kind_id', 'health_warning', 'extra_info', 'order_number')
  .where('symbol_kind_id', id)

  let results = async() => Promise.all(symbols.map(item => {
    const symbols = db('symbol_connections')
      .select('connected_symbol_id')
      .where('main_symbol_id', item.symbol_id)

    return symbols.then(res =>  {

      let connections = []
      res.map(symbol_id => {
        kindInfoKinds.map(kindMatch => {
          kindMatch.map(kindSymbol => {
            if(symbol_id.connected_symbol_id === kindSymbol.symbol_id){
              connections.push(kindSymbol)
            }
          })
        })
      })

      return {...item, connections}

    })
   
  }))

  results = await results()
  return results

}

function getCategories(id) {
  return db('category_to_kinds')
  .leftJoin('categories', 'category_to_kinds.ck_category_id', 'categories.category_id')
  .select('category_kind_id', 'ck_category_id', 'category_id', 'ck_description', 'category_name', 'category_number', 'category_description')
  .where('ck_kind_id', id)
}

function add(kind) {
  return db('kinds')
    .insert(kind)
    .returning('kind_id')
    .then(res => {
      return findById(res[0])
    })
}

function update(changes, id) {
  return db('kinds')
    .where('kind_id', id)
    .update(changes);
}

function remove(id) {
  return db('kinds')
    .where( 'kind_id', id )
    .del();
}
