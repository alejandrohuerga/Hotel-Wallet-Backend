require('dotenv').config();
const express = require('express');
const path = require('path');
const { createHotelClass } = require('./src/services/walletService');
const passRoutes = require('./src/routes/passRoutes');

const app = express();
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', passRoutes);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  try {
    await createHotelClass();
    console.log('✓ Clase del hotel lista en Google Wallet');
  } catch (err) {
    console.error('Error inicializando la clase:', err.message);
  }
});