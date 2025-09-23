const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('=== Checking Database Users ===');
    
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
      }
    });
    
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Image: ${user.image}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Accounts: ${user.accounts.length}`);
      console.log(`  Sessions: ${user.sessions.length}`);
      
      if (user.accounts.length > 0) {
        user.accounts.forEach((account, accIndex) => {
          console.log(`    Account ${accIndex + 1}: ${account.provider} (${account.type})`);
        });
      }
    });
    
    console.log('\n=== Checking Sessions ===');
    const sessions = await prisma.session.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`Found ${sessions.length} active sessions:`);
    sessions.forEach((session, index) => {
      console.log(`\nSession ${index + 1}:`);
      console.log(`  Token: ${session.sessionToken.substring(0, 20)}...`);
      console.log(`  User: ${session.user.name} (${session.user.email})`);
      console.log(`  Expires: ${session.expires}`);
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();