const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


const connectDB = async () => {
  try {
    // With adapters, we don't necessarily call $connect() manually but we can to verify
    await prisma.$connect();
    console.log('PostgreSQL (Supabase) Connected via Prisma + Driver Adapter');
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };
