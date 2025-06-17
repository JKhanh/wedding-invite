const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`Successfully connected! Found ${userCount} users.`);
    
    const giftCount = await prisma.gift.count();
    console.log(`Found ${giftCount} gifts.`);
    
    await prisma.$disconnect();
    console.log('Connection closed successfully.');
  } catch (error) {
    console.error('Database connection error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();