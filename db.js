const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_store')
const bcrypt = require('bcrypt')
const uuid = require('uuid')

const createTables = async ()=> {
  const SQL = `
  DROP TABLE IF EXISTS favorite CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  DROP TABLE IF EXISTS products CASCADE;

  CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(20) NOT NULL,
    password VARCHAR(200)
  );
  CREATE TABLE products(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(20) UNIQUE NOT NULL
  );
  CREATE TABLE favorite(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    CONSTRAINT unique_user_product UNIQUE(user_id, product_id)
  );
  `;
  await client.query(SQL);
}

const createUser = async ({username, password}) => {
  const SQL = `
  INSERT INTO users(id, username, password)
  VALUES($1, $2, $3)
  RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
  return response.rows[0]
}

const createProduct = async({name}) => {
  const SQL =`
  INSERT INTO products(name)
  VALUES($1)
  RETURNING *
  `;
  const response = await client.query(SQL, [name])
  return response.rows[0]
};

const createFavorite = async ({user_id, product_id}) => {
  const SQL = `
  INSERT INTO favorite(id, user_id, product_id)
  VALUES($1, $2, $3)
  RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
  return response.rows[0];
}

const fetchUsers = async() => {
  const SQL = `
  SELECT *
  FROM users`;
  const response = await client.query(SQL);
  return response.rows
};

const fetchProducts = async() => {
  const SQL = `
  SELECT *
  FROM products`;
  const response = await client.query(SQL);
  return response.rows
};

const fetchFavorite = async(id) => {
  const SQL = `
  SELECT *
  FROM favorite`;
  // WHERE user_id = $1
  const response = await client.query(SQL);
  return response.rows
};

// const fetchSingleFavorite = async(id) => {
//   const SQL = `
//   SELECT *
//   FROM favorite
//   WHERE user_id = $1`;
//   const response = await client.query(SQL, [id]);
//   return response.rows
// };

const deleteFavorite = async ({user_id, product_id}) => {
  const SQL = `
  DELETE FROM favorite
  WHERE user_id = $1 AND product_id = $2
  `;
  await client.query(SQL, [user_id, product_id]);
}

module.exports = {client, createTables, createUser, createProduct, createFavorite, fetchUsers, fetchProducts, fetchFavorite, deleteFavorite}