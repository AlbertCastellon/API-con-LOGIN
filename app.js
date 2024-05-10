const express = require ('express')
const routes = require('./rutas/router.js')
const session = require('express-session');
const app = express()
const users = require('./users/users.js')
const clave = require('./crypto/crypto.js') 
currentPage=1

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
      secret: clave,
      resave: false,
      saveUninitialized: true, 
      cookie: { secure: false },
    })
  );

app.use('/', routes)




app.listen(3000,()=>{
    console.log('express esta escuchando en el puerto http://localhost:3000/')
})