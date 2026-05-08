// src/routes/passRoutes.js
const express = require('express');
const router = express.Router();
const { generatePassJwt } = require('../services/walletService');

// La app Android llama a este endpoint con el id de reserva
router.get('/pass/:reservaId', async (req, res) => {
  try {
    // En producción estos datos vendrían de tu base de datos
    // Por ahora los simulamos para probar
    const reserva = {
      id: req.params.reservaId,
      nombreHotel: 'Hotel Ejemplo 2',
      nombreHuesped: 'Alvaro Garcia',
      codigoReserva: `RES-${req.params.reservaId}`,
      fechaCheckin: '18 Jun 2025',
      fechaCheckout: '25 Jun 2025',
      numeroHabitacion: '34',
      colorHotel: '#2c3e50',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Culinary_fruits_front_view.jpg/320px-Culinary_fruits_front_view.jpg',
      heroImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Culinary_fruits_front_view.jpg/640px-Culinary_fruits_front_view.jpg',
    };

    const token = await generatePassJwt(reserva);
    res.json({ jwt: token });

  } catch (error) {
    console.error('Error generando el pase:', error);
    res.status(500).json({ error: 'Error al generar el pase' });
  }
});

module.exports = router;