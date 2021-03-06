exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('users', tbl => {
      tbl.increments('user_id');
      tbl.text('password', 128).notNullable();
      tbl.text('username', 32).notNullable().unique();
      tbl.text('user_email', 128).notNullable().unique();
      tbl.text('user_bio');
      tbl.text('user_link', 128);
      tbl.text('user_link_description');
      tbl.integer('user_role');
      tbl.boolean('user_verified');
    })

};

exports.down = function(knex, Promise) {
  // drops the entire table
  return knex.schema
    .dropTableIfExists('users')
};
