const server = require('../server.js');
const request = require('supertest');
const db = require('../data/dbConfig.js');
var knexCleaner = require('knex-cleaner');
const Users = require('../components/users/user-model.js');

const pantheon_info = {pantheon_name: "Testingantheon"}
let pantheon_id = 0

const kind_info = {kind_name: "Testingind"}
let kind_id = 0

const symbol_info = {symbol_name: "Testingymbol"}
let symbol_id = 0

const category_info = {category_name: "Testingategory"}
let category_id = 0

let main_info = {cs_symbol_id: 0, cs_category_id: 0}
let main_object = {}


const user_cred = {username: "pantheon_creator", password: "test", user_email: "pantheon_creator"}
const bcrypt = require('bcryptjs')
const user_hash = bcrypt.hashSync("pantheon_creator", 2)

let user_token = ""
let user_obj = {}

module.exports = describe("***", () => {describe("Pantheon Tests", () => {
    it("Finding user tests", async () => {
      await knexCleaner.clean(db)
      expect(1).toBe(1);
      const user_response = await request(server).post('/api/users/auth/register').send(user_cred);
      user_obj = JSON.parse(user_response.text).user
      const verify_response = await request(server).get(`/api/users/auth/verify/${user_obj.user_id}/${encodeURIComponent(user_hash)}`);
      const login_response = await request(server).post('/api/users/auth/login').send(user_cred);
      user_token = JSON.parse(login_response.text).token
      await Users.update({user_role:3}, user_obj.user_id)
      user_obj = await Users.findById(user_obj.user_id)
      expect(1).toBe(1);
  })

  it("Create pantheon with auth", async () => {
      const expectedStatusCode = 201;
      const response = await request(server).post('/api/pantheons').send(pantheon_info).set("Authorization", user_token);
      pantheon_id = JSON.parse(response.text).pantheon_id
      kind_info.creator_pantheon_id = pantheon_id
      expect(response.status).toBe(expectedStatusCode);
  })

  it("Create kind with auth", async () => {
      const expectedStatusCode = 201;
      const response = await request(server).post('/api/kinds').send(kind_info).set("Authorization", user_token);
      kind_id = JSON.parse(response.text).kind_id
      symbol_info.symbol_kind_id = kind_id
      expect(response.status).toBe(expectedStatusCode);
  })

  it("Create symbol with auth", async () => {
      const expectedStatusCode = 201;
      const response = await request(server).post('/api/symbols').send(symbol_info).set("Authorization", user_token);
      symbol_id = JSON.parse(response.text).symbol_id
      main_info.cs_symbol_id = symbol_id
      expect(response.status).toBe(expectedStatusCode);
  })

  it("Create category with auth", async () => {
      const expectedStatusCode = 201;
      const response = await request(server).post('/api/categories').send(category_info).set("Authorization", user_token);
      category_id = JSON.parse(response.text).category_id
      main_info.cs_category_id = category_id
      expect(response.status).toBe(expectedStatusCode);
  })


  it("Create kind_symbol", async () => {
      const expectedStatusCode = 201;
      const response = await request(server).post('/api/categories/symbols').send(main_info).set("Authorization", user_token);
      main_object = JSON.parse(response.text)
      expect(response.status).toBe(expectedStatusCode);
  })

  it("GET the symbol", async () => {
      const expectedStatusCode = 200;
      const response = await request(server).get(`/api/categories/${category_id}`);
      expect(response.status).toBe(expectedStatusCode);

      const fullObj = JSON.parse(response.text)
      expect(fullObj.symbols.length).toBe(1)
      expect(fullObj.symbols[0].symbol_name).toBe("Testingymbol")
  })

  it("Edit kind_symbol", async () => {
      const expectedStatusCode = 200;
      const response = await request(server).put(`/api/categories/symbols/${main_object.category_symbol_id}`).send(main_info).set("Authorization", user_token);
      expect(response.status).toBe(expectedStatusCode);
  })
  it("Delete kind_symbol", async () => {
      const expectedStatusCode = 200;
      const response = await request(server).delete(`/api/categories/symbols/${main_object.category_symbol_id}`).set("Authorization", user_token);
      expect(response.status).toBe(expectedStatusCode);
  })

  })
})
