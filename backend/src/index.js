import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import costumeRoutes from './routes/costumes.js';
import voteRoutes from './routes/votes.js';
import configRoutes from './routes/config.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Configure uploads directory (Railway Volume or local)
const UPLOADS_DIR = process.env.UPLOADS_DIR || 'uploads';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`✅ Created uploads directory: ${UPLOADS_DIR}`);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Routes
app.use('/api/costumes', costumeRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    message: 'VotAlloween API is running',
    uptime: process.uptime(),
    memory: {
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
    }
  });
});

// Debug endpoint - Storage information
app.get('/api/debug/storage', (req, res) => {
  try {
    const uploadsDir = UPLOADS_DIR;
    const uploadsExists = fs.existsSync(uploadsDir);

    let files = [];
    let totalSize = 0;

    if (uploadsExists) {
      const filesList = fs.readdirSync(uploadsDir);
      files = filesList.map(filename => {
        const filepath = `${uploadsDir}/${filename}`;
        const stats = fs.statSync(filepath);
        totalSize += stats.size;
        return {
          filename,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2),
          created: stats.birthtime,
          modified: stats.mtime,
        };
      });
    }

    res.json({
      uploadsDirectory: uploadsDir,
      directoryExists: uploadsExists,
      fileCount: files.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      files: files.sort((a, b) => new Date(b.created) - new Date(a.created)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download all photos as ZIP
app.get('/api/photos/download-all', async (req, res) => {
  try {
    const uploadsDir = UPLOADS_DIR;

    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({ error: 'No se encontró el directorio de fotos' });
    }

    const files = fs.readdirSync(uploadsDir);

    if (files.length === 0) {
      return res.status(404).json({ error: 'No hay fotos para descargar' });
    }

    // Get costume info for better file naming
    const costumes = await prisma.costume.findMany({
      select: {
        imageUrl: true,
        participantName: true,
      },
    });

    // Create a map of filename -> participant name
    const filenameMap = {};
    costumes.forEach(costume => {
      const filename = path.basename(costume.imageUrl);
      filenameMap[filename] = costume.participantName;
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=votalloween-fotos-${Date.now()}.zip`);

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add all files to archive
    files.forEach(filename => {
      const filePath = path.join(uploadsDir, filename);
      const participantName = filenameMap[filename] || 'Unknown';
      const ext = path.extname(filename);

      // Use participant name in zip filename
      const zipFilename = `${participantName}-${filename}`;

      archive.file(filePath, { name: zipFilename });
    });

    // Finalize the archive
    await archive.finalize();

    console.log(`📦 ZIP download: ${files.length} files`);
  } catch (error) {
    console.error('Error creating ZIP:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al crear el archivo ZIP' });
    }
  }
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
