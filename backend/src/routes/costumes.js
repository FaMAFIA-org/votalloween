import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
});

// GET all costumes
router.get('/', async (req, res) => {
  try {
    const costumes = await prisma.costume.findMany({
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(costumes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener disfraces' });
  }
});

// GET costumes by deviceId
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const costumes = await prisma.costume.findMany({
      where: { deviceId },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(costumes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener disfraces del dispositivo' });
  }
});

// POST new costume
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { participantName, costumeName, deviceId } = req.body;

    if (!participantName || !deviceId) {
      return res.status(400).json({ error: 'Nombre del participante y deviceId son requeridos' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'La imagen es requerida' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const costume = await prisma.costume.create({
      data: {
        participantName,
        costumeName: costumeName || null,
        imageUrl,
        deviceId,
      },
    });

    res.status(201).json(costume);
  } catch (error) {
    console.error('Error creating costume:', error);
    res.status(500).json({ error: 'Error al crear disfraz' });
  }
});

// PUT update costume
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { participantName, costumeName } = req.body;

    const updateData = {
      participantName,
      costumeName: costumeName || null,
    };

    // If new image uploaded, update imageUrl
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const costume = await prisma.costume.update({
      where: { id },
      data: updateData,
    });

    res.json(costume);
  } catch (error) {
    console.error('Error updating costume:', error);
    res.status(500).json({ error: 'Error al actualizar disfraz' });
  }
});

// DELETE costume
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.costume.delete({
      where: { id },
    });
    res.json({ message: 'Disfraz eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar disfraz' });
  }
});

export default router;
