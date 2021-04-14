// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '',
      database : 'grimwire',
      charset: 'utf8'
    },
    migrations: { directory: './data/migrations' },
    seeds: { directory: './data/seeds' }
  },
    testing: {
      client: 'pg',
      connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : '',
        database : 'grimwire-test',
        charset: 'utf8'
      },
      migrations: { directory: './data/migrations' },
      seeds: { directory: './data/seeds' }
    },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './data/migrations' },
    seeds: { directory: './data/seeds' },
    ssl: { rejectUnauthorized: 'false' },
    sslmode: 'require', 
    sslFactory: "org.postgresql.ssl.NonValidatingFactory"
  }


};
