const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(l => {
  if (l.includes('=')) {
    const [k, ...v] = l.split('=');
    process.env[k.trim()] = v.join('=').trim().replace(/['"]+/g, '');
  }
});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Status: ${u.status}`));
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
