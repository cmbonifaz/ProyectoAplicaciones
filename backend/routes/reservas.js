const express = require('express');
const Reserva = require('../models/Reserva');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protege todas las rutas siguientes con autenticación
router.use(authMiddleware);

// Listar todas las reservas del usuario autenticado
router.get('/', async (req, res) => {
  const reservas = await Reserva.find({ usuario: req.userId });
  res.json(reservas);
});

// Crear nueva reserva
router.post('/', async (req, res) => {
  const { fecha, sala, hora } = req.body;



  if (!sala || !["A", "B", "C"].includes(sala)) {
    return res.status(400).json({ msg: 'Sala inválida' });
  }

  const nueva = new Reserva({
    usuario: req.userId,
    fecha,
    sala,
    hora
  });

  await nueva.save();
  res.status(201).json(nueva);
});

// Eliminar una reserva (solo si pertenece al usuario)
router.delete('/:id', async (req, res) => {
  const resultado= await Reserva.deleteOne({ _id: req.params.id, usuario: req.userId });

  //Si no se elimino ninguna reserva (no existe o no pertenece al usuario)
 
  if (resultado.deletedCount === 0) {
    return res.status(404).json({ msg: 'Reserva no encontrada o no tienes permiso para eliminarla' });
  }

  res.json({ msg: 'Reserva cancelada' });
});

module.exports = router;