const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const nasaApi = require('../config/nasa');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const fetchAndSaveApod = async () => {
  try {
    console.log('[Scheduler] Fetching today\'s APOD...');
    const response = await nasaApi.get('/planetary/apod');
    const apodData = response.data;
    
    // Check if it already exists
    const existing = await prisma.favorite.findFirst({
      where: {
        nasaId: apodData.date, // use date as nasaId for APOD
        type: 'APOD'
      }
    });

    if (existing) {
      console.log('[Scheduler] APOD for today already exists.');
      return;
    }

    await prisma.favorite.create({
      data: {
        title: apodData.title,
        type: 'APOD',
        nasaId: apodData.date,
        imageUrl: apodData.url,
        notes: apodData.explanation,
        tags: ['automated', 'daily']
      }
    });
    
    console.log('[Scheduler] Successfully saved today\'s APOD.');
  } catch (error) {
    console.error('[Scheduler] Failed to fetch or save APOD:', error.message);
  }
};

// Run every day at 00:00 UTC
const initScheduler = () => {
  cron.schedule('0 0 * * *', fetchAndSaveApod, {
    scheduled: true,
    timezone: 'UTC'
  });
  
  console.log('[Scheduler] APOD daily job initialized.');
  
  // Restart safety check: Try to fetch today's APOD right away if missed
  fetchAndSaveApod();
};

module.exports = initScheduler;
