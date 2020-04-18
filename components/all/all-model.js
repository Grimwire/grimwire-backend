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
  .orderBy('pantheon_name', sortdir)
  .leftJoin('images', 'pantheons.pantheon_id', 'images.foreign_id')
  .where('pantheon_name', 'iLIKE', `%${searchTerm}%`)
  .andWhere(function() {
    this.where(function() {
      this.where('foreign_class', "Pantheon").andWhere('thumbnail', true)
    }).orWhere(function() {
      this.whereNull('foreign_class').whereNull('thumbnail')
    })
  })
  .then()
  .catch(err => console.log(err))

}

function listOfNames() {
  return db('pantheons')
  .select('pantheon_name', 'pantheon_id')
}
