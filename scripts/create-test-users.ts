const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a regular guest
    const regularGuest = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'Regular',
        bridalParty: false,
        nzInvite: true,
        myInvite: false,
        dinner: false, // Regular guest - no dinner access
      },
    });
    console.log('Created regular guest:', regularGuest);

    // Create a dinner guest
    const dinnerGuest = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'Dinner',
        bridalParty: false,
        nzInvite: true,
        myInvite: false,
        dinner: true, // Dinner guest - has reception access
      },
    });
    console.log('Created dinner guest:', dinnerGuest);

    // Create a bridal party member (bonus)
    const bridalPartyMember = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'Bridal',
        bridalParty: true, // Bridal party member
        nzInvite: true,
        myInvite: false,
        dinner: true, // Usually bridal party also attends dinner
      },
    });
    console.log('Created bridal party member:', bridalPartyMember);

    console.log('\n✅ Test users created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Password for all users:', process.env.PASSWORD || '123456');
    console.log('\n👤 Regular Guest:');
    console.log('  First Name: Test');
    console.log('  Last Name: Regular');
    console.log('  Access: Basic dashboard only');
    console.log('\n🍽️ Dinner Guest:');
    console.log('  First Name: Test');
    console.log('  Last Name: Dinner');
    console.log('  Access: Dashboard + Reception info');
    console.log('\n💐 Bridal Party:');
    console.log('  First Name: Test');
    console.log('  Last Name: Bridal');
    console.log('  Access: Dashboard + Reception + Bridal party status');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();