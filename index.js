
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser'); 
const { loadCommonPasswords, evaluatePassword } = require('./password.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


async function initialize() {
    console.log("Cargando diccionario de contraseñas comunes desde el CSV...");
    const passwords = [];
    const filePath = '1millionPasswords.csv'; 

    fs.createReadStream(filePath)
      .pipe(csv({ 
        headers: ['rank','password']
      }))
      .on('data', (row) => {
          if (row.password) {
              passwords.push(row.password.trim());
          }
      })
      .on('end', () => {
          loadCommonPasswords(passwords);
          console.log(`Diccionario cargado con ${passwords.length} contraseñas.`);

          app.listen(PORT, () => {
              console.log(`Servidor escuchando en http://localhost:${PORT}`);
          });
      })
      .on('error', (error) => {
          console.error("Error al leer el archivo CSV:", error.message);
          process.exit(1); 
      });
}

app.post('/api/v1/password/evaluate', (req, res) => {
    const { password } = req.body;
    if (!password || typeof password !== 'string' || password.length === 0) {
        return res.status(400).json({
            error: "La propiedad 'password' es requerida y debe ser un string no vacío."
        });
    }
    const evaluation = evaluatePassword(password);
    res.status(200).json(evaluation);
});

initialize();