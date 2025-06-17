const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();

function generateToken() {
  return randomBytes(12).toString('hex');
}

async function migrateGuestTokens() {
  try {
    console.log('Starting guest token migration...');
    
    // Get all users without tokens
    const usersWithoutTokens = await prisma.user.findMany({
      where: {
        rsvpToken: null
      }
    });
    
    console.log(`Found ${usersWithoutTokens.length} users without RSVP tokens`);
    
    // Update each user with a unique token
    for (const user of usersWithoutTokens) {
      let token;
      let isUnique = false;
      
      // Generate unique token
      while (!isUnique) {
        token = generateToken();
        const existing = await prisma.user.findUnique({
          where: { rsvpToken: token }
        });
        isUnique = !existing;
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          rsvpToken: token,
          invitedAt: new Date()
        }
      });
      
      console.log(`Updated ${user.firstName} ${user.lastName} with token: ${token}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateGuestTokens();