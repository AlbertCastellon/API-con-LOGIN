const express = require('express');
const users = require('../users/users.js')
const session = require('express-session');
const router = express.Router();
const {generateToken, verifyToken} = require('../middlewares/middlewares.js')
const axios= require('axios')

router.get('/', (req, res) => {
    if(!req.session.token) {
        res.send(`<form action="/login" method="post">
        <label for="username">Usuario:</label>
        <input type="text" id="username" name="username" required><br>
        
              <label for="password">Contraseña:</label>
              <input type="password" id="password" name="password" required><br>
        
              <button type="submit">Iniciar sesión</button>
            </form>
            <a href="/search">Buscador</a>
        
        `)
    }else {
        res.send(`<form action="/logout" method="post"> <button type="submit">Cerrar sesión</button> </form> <a href="/search">Buscador de personajes</a>`)
    }
    
})
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
  
    if (user) {
      const token = generateToken(user);
      req.session.token = token;
      res.redirect('/search');
    } else {
      res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  });

router.get('/search', verifyToken, (req, res) => {
    const userId = req.user;

    const user = users.find((u) => u.id === userId);

    
    if (user) {
        req.loged = true
        res.send(` <h1>Bienvenido, ${user.name}!</h1>
        <h2>Escoge un personaje de Rick y Morty</h2>
        <form method="post">
        <label for="characterName">Introduce el nombre de un personaje</label>
        <input type="text" id="characterName" name="characterName">
        <button type="submit">Buscar</button>
        </form>
         <br> <form action="/logout" method="post"> 
         <button type="submit">Cerrar sesión</button> 
         </form> <a href="/">Home</a> `);
    } else {
        res.status(401).json({ message: 'Usuario no encontrado' });
    }
});

router.post('/search', (req, res) => {
    const { characterName } = req.body

    try {
        res.redirect(`/characters/${characterName}`)
    }catch(ERROR){
        res.status(404).json({error:'personaje no encontrado'})
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
    });


router.get(`/characters/:characterName`, verifyToken, async (req, res) => {
    const userId = req.user;

    const user = users.find((u) => u.id === userId);
    if (user){
        const characterName=req.params.characterName
        const url=`https://rickandmortyapi.com/api/character/?name=${characterName}`
        try{
            const response = await axios.get(url)
            const {name,status,species,gender,origin,image}=response.data.results[0]
            
            res.send(`<h1>${name}</h1>
            <img src="${image}" alt="${name}">
            <p>Status: ${status}</p>
            <p>Especie: ${species}</p>
            <p>Gender: ${gender}</p>
            <p>Origen: ${origin.name}</p>
            `)
        } catch(ERROR){
            res.status(404).json({error:'objeto no encontrado'})
        
        }
    }
        })
        
router.get(`/characters/`, verifyToken, async (req, res) => {
    const userId = req.user;

    const user = users.find((u) => u.id === userId);
    if (user){
            try {
                
                let allCharacters = [];
        
                for (let i = 1; i <= 42; i++) {
                    const url = `https://rickandmortyapi.com/api/character/?page=${i}`;
                    const response = await axios.get(url);
                    allCharacters = allCharacters.concat(response.data.results);
                }
        
                res.json({ allCharacters });
            } catch (error) {
                res.status(404).json({ error: 'objeto no encontrado' });
            }
        }
        });
          

module.exports = router;