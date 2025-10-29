import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET check if device has voted
router.get('/check/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const votes = await prisma.vote.findMany({
      where: { deviceId },
      include: { costume: true },
    });

    const hasVotedAll = votes.length === 4; // Must vote in all 4 categories
    const votesByCategory = {};
    votes.forEach(vote => {
      votesByCategory[vote.category] = vote;
    });

    res.json({
      hasVoted: hasVotedAll,
      votes: votesByCategory,
      votedCategories: votes.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar voto' });
  }
});

// POST submit votes (all 4 categories at once)
router.post('/', async (req, res) => {
  try {
    const { deviceId, votes } = req.body;
    // votes = { best: costumeId, funniest: costumeId, most_elaborate: costumeId, best_group: costumeId }

    if (!deviceId || !votes) {
      return res.status(400).json({ error: 'deviceId y votes son requeridos' });
    }

    const categories = ['best', 'funniest', 'most_elaborate', 'best_group'];

    // Validate all categories are present
    for (const category of categories) {
      if (!votes[category]) {
        return res.status(400).json({ error: `Falta voto para categoría: ${category}` });
      }
    }

    // Check if device already voted in any category
    const existingVotes = await prisma.vote.findMany({
      where: { deviceId },
    });

    if (existingVotes.length > 0) {
      return res.status(400).json({ error: 'Este dispositivo ya ha votado' });
    }

    // Create all votes in a transaction
    const voteRecords = await prisma.$transaction(
      categories.map(category =>
        prisma.vote.create({
          data: {
            deviceId,
            costumeId: votes[category],
            category,
          },
          include: { costume: true },
        })
      )
    );

    res.status(201).json({
      message: '¡Votos registrados correctamente!',
      votes: voteRecords,
    });
  } catch (error) {
    console.error('Error submitting votes:', error);
    res.status(500).json({ error: 'Error al registrar votos' });
  }
});

// GET vote results (grouped by category)
router.get('/results', async (req, res) => {
  try {
    const votes = await prisma.vote.findMany({
      include: {
        costume: {
          select: {
            id: true,
            participantName: true,
            costumeName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Group by category and count
    const resultsByCategory = {
      best: {},
      funniest: {},
      most_elaborate: {},
      best_group: {},
    };

    votes.forEach(vote => {
      const category = vote.category;
      const costumeId = vote.costumeId;

      if (!resultsByCategory[category][costumeId]) {
        resultsByCategory[category][costumeId] = {
          costume: vote.costume,
          votes: 0,
        };
      }
      resultsByCategory[category][costumeId].votes++;
    });

    // Convert to sorted arrays
    const results = {};
    Object.keys(resultsByCategory).forEach(category => {
      results[category] = Object.values(resultsByCategory[category])
        .sort((a, b) => b.votes - a.votes);
    });

    const totalVoters = await prisma.vote.findMany({
      distinct: ['deviceId'],
    });

    res.json({
      results,
      totalVoters: totalVoters.length,
      totalVotes: votes.length,
    });
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({ error: 'Error al obtener resultados' });
  }
});

export default router;
