import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET current config
router.get('/', async (req, res) => {
  try {
    const config = await prisma.config.findFirst();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// PUT update config (change phase, set voting times)
router.put('/', async (req, res) => {
  try {
    const { phase, votingStartTime, votingEndTime } = req.body;

    const config = await prisma.config.findFirst();

    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const updateData = {};
    if (phase) updateData.phase = phase;
    if (votingStartTime !== undefined) updateData.votingStartTime = votingStartTime ? new Date(votingStartTime) : null;
    if (votingEndTime !== undefined) updateData.votingEndTime = votingEndTime ? new Date(votingEndTime) : null;

    const updatedConfig = await prisma.config.update({
      where: { id: config.id },
      data: updateData,
    });

    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

export default router;
