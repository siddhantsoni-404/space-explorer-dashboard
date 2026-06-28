const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

exports.createFavorite = async (req, res, next) => {
  try {
    const { title, type, nasaId, imageUrl, notes, tags } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, message: 'Title and type are required.', data: null });
    }

    const favorite = await prisma.favorite.create({
      data: {
        title,
        type,
        nasaId,
        imageUrl,
        notes,
        tags: tags || []
      }
    });

    res.status(201).json({
      success: true,
      message: 'Favorite created successfully',
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllFavorites = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};

    const favorites = await prisma.favorite.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Favorites fetched successfully',
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

exports.getOneFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: { id }
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found.', data: null });
    }

    res.status(200).json({
      success: true,
      message: 'Favorite fetched successfully',
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};

exports.updateFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, tags } = req.body;

    const existing = await prisma.favorite.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Favorite not found.', data: null });
    }

    const favorite = await prisma.favorite.update({
      where: { id },
      data: {
        notes: notes !== undefined ? notes : existing.notes,
        tags: tags !== undefined ? tags : existing.tags
      }
    });

    res.status(200).json({
      success: true,
      message: 'Favorite updated successfully',
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.favorite.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Favorite not found.', data: null });
    }

    await prisma.favorite.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Favorite deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
