import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET check if device has voted
router.get('/check/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const vote = await prisma.vote.findUnique({
      where: { deviceId },
      include: { costume: true },
    });

    if (vote) {
      res.json({ hasVoted: true, vote });
    } else {
      res.json({ hasVoted: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar voto' });
  }
});

// POST submit vote
router.post('/', async (req, res) => {
  try {
    const { deviceId, costumeId } = req.body;

    if (!deviceId || !costumeId) {
      return res.status(400).json({ error: 'deviceId y costumeId son requeridos' });
    }

    // Check if device already voted
    const existingVote = await prisma.vote.findUnique({
      where: { deviceId },
    });

    if (existingVote) {
      return res.status(400).json({ error: 'Este dispositivo ya ha votado' });
    }

    // Create vote and increment costume votes in a transaction
    const result = await prisma.$transaction([
      prisma.vote.create({
        data: {
          deviceId,
          costumeId,
        },
      }),
      prisma.costume.update({
        where: { id: costumeId },
        data: {
          votes: {
            increment: 1,
          },
        },
      }),
    ]);

    res.status(201).json({
      message: '¡Voto registrado correctamente!',
      vote: result[0],
      costume: result[1],
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Error al registrar voto' });
  }
});

// GET vote results (all costumes with vote counts)
router.get('/results', async (req, res) => {
  try {
    const costumes = await prisma.costume.findMany({
      orderBy: { votes: 'desc' },
      select: {
        id: true,
        participantName: true,
        costumeName: true,
        imageUrl: true,
        votes: true,
      },
    });

    const totalVotes = await prisma.vote.count();

    res.json({
      costumes,
      totalVotes,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resultados' });
  }
});

export default router;
