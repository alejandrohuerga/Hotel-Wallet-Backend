// src/services/walletService.js
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/walletConfig');

// Autenticación con la cuenta de servicio de Google Cloud
const auth = new google.auth.GoogleAuth({
  credentials: config.credentials,
  scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
});

const walletClient = google.walletobjects({ version: 'v1', auth });

// ── Crear la clase del hotel (se hace UNA sola vez) ──────────────────────────
async function createHotelClass() {
  const hotelClass = {
    id: config.classId,
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: 'object.textModulesData["checkin"]' }],
                },
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: 'object.textModulesData["checkout"]' }],
                },
              },
            },
          },
          {
            oneItem: {
              item: {
                firstValue: {
                  fields: [{ fieldPath: 'object.textModulesData["habitacion"]' }],
                },
              },
            },
          },
        ],
      },
    },
  };

  try {
    // Si ya existe, la devuelve directamente
    await walletClient.genericclass.get({ resourceId: config.classId });
    console.log(`Clase ${config.classId} ya existe.`);
  } catch (err) {
    if (err.code === 404) {
      const response = await walletClient.genericclass.insert({ requestBody: hotelClass });
      console.log('Clase creada:', response.data.id);
    } else {
      throw err;
    }
  }
}

// ── Crear el objeto (instancia por reserva) ──────────────────────────────────
function buildPassObject(reserva) {
  const objectId = `${config.issuerId}.reserva_${reserva.id}`;

  return {
    id: objectId,
    classId: config.classId,
    state: 'ACTIVE',

    // Datos del huésped y reserva
    cardTitle: {
      defaultValue: { language: 'es-ES', value: 'Reserva de hotel' },
    },
    subheader: {
      defaultValue: { language: 'es-ES', value: reserva.nombreHotel },
    },
    header: {
      defaultValue: { language: 'es-ES', value: reserva.nombreHuesped },
    },

    // Logo del hotel (debe estar en HTTPS público)
    logo: {
      sourceUri: { uri: reserva.logoUrl },
      contentDescription: {
        defaultValue: { language: 'es-ES', value: 'Logo del hotel' },
      },
    },

    // Imagen de cabecera
    heroImage: {
      sourceUri: { uri: reserva.heroImageUrl },
      contentDescription: {
        defaultValue: { language: 'es-ES', value: reserva.nombreHotel },
      },
    },

    // Código QR de la reserva
    barcode: {
      type: 'QR_CODE',
      value: reserva.codigoReserva,
      alternateText: reserva.codigoReserva,
    },

    // Campos personalizados visibles en el pase
    textModulesData: [
      {
        id: 'checkin',
        header: 'Check-in',
        body: reserva.fechaCheckin,
      },
      {
        id: 'checkout',
        header: 'Check-out',
        body: reserva.fechaCheckout,
      },
      {
        id: 'habitacion',
        header: 'Habitación',
        body: reserva.numeroHabitacion,
      },
    ],

    // Color corporativo del hotel (hex)
    hexBackgroundColor: reserva.colorHotel || '#1a1a2e',
  };
}

// ── Generar el JWT que recibe la app Android ─────────────────────────────────
async function generatePassJwt(reserva) {
  const passObject = buildPassObject(reserva);

  const claims = {
    iss: config.credentials.client_email,
    aud: 'google',
    origins: [],
    typ: 'savetowallet',
    payload: {
      genericObjects: [passObject],
    },
  };

  const token = jwt.sign(claims, config.credentials.private_key, {
    algorithm: 'RS256',
  });

  return token;
}

module.exports = { createHotelClass, generatePassJwt };