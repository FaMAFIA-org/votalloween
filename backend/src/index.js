import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import costumeRoutes from './routes/costumes.js';
import voteRoutes from './routes/votes.js';
import configRoutes from './routes/config.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/costumes', costumeRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'VotAlloween API is running' });
});

// Initialize config if not exists
async function initializeConfig() {
  const config = await prisma.config.findFirst();
  if (!config) {
    await prisma.config.create({
      data: {
        phase: 'upload',
      },
    });
    console.log('✅ Config initialized');
  }
}

// Start server
app.listen(PORT, async () => {
  await initializeConfig();
  console.log(`🎃 VotAlloween API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
