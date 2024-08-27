const express = require('express')
const app = express()
const {client, createTables, createUser, createProduct, fetchUsers, fetchProducts, createFavorite, fetchFavorite, deleteFavorite} = require('./db')
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));

app.get('/api/users', async(req, res, next) => {
  try{
    res.send(await fetchUsers());
  }catch(err){
    next(err);
  }
});

app.get('/api/products', async(req, res, next) => {
  try{
    res.send(await fetchProducts());
  }catch(err){
    next(err)
  }
});

app.get('/api/favorite', async(req, res, next) => {
  try{
    res.send(await fetchFavorite());
  }catch(err){
    next(err);
  }
});

app.get('/api/users/:id/favorite', async(req, res, next) => {
  try{
    res.send(await fetchFavorite(req.params.id))
  }catch(err){
    next(ex);
  }
});

app.post('/api/users/:id/favorite', async (req, res, next) => {
  try{
    res.status(201).send(await favorite({user_id: req.params.id, product_id: req.body.product_id}));
  }catch(err){
    next(err);
  }
});

app.delete('/api/users/:userId/favorite/:id', async(req, res, next) => {
  try{
    await deleteFavorite({id:req.params.id, user_id: req.params.userId});
    res.sendStatus(204);
  }catch(err){
    next(err);
  }
});

const init = async () => {
  await client.connect()
  console.log('Connected to database');
  await createTables();
  console.log('Tables created');
  const [Sophia, Ryan, Lina, Shoes, Hat, Necklace, Sweater, Dress] = await Promise.all([
    createUser({username: "Sophia", password: "spassword"}), 
    createUser({username: "Ryan", password: "rpassword"}), 
    createUser({username: "Lina", password: "lpassword"}),
    createProduct({name: "Shoes"}),
    createProduct({name: "Hat"}),
    createProduct({name: "Necklace"}),
    createProduct({name: "Sweater"}),
    createProduct({name: "Dress"})
  ]);
  const users = await fetchUsers();
  console.log(users);
  const products = await fetchProducts();
  console.log(products);

  const favorite = await Promise.all([
    createFavorite({user_id: Sophia.id, product_id: Necklace.id}),
    createFavorite({user_id: Ryan.id, product_id: Shoes.id}),
    createFavorite({user_id: Lina.id, product_id: Dress.id}),
    createFavorite({user_id: Lina.id, product_id: Necklace.id}),
    createFavorite({user_id: Ryan.id, product_id: Hat.id})
    


  ]);

console.log("Sophia: " + await fetchFavorite());


};

init();