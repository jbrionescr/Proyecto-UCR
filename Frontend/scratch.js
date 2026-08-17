const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(l => {
  if(l.includes('=')){
    const [k,...v] = l.split('=');
    process.env[k.trim()] = v.join('=').trim().replace(/['"]+/g, '');
  }
});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log('User ID:', user?.id);
    const ex = await prisma.exalumno.findMany();
    console.log('Exalumnos:', ex.length);
    const err = await prisma.exalumno.create({
      data: {
        id: user.id, // using actual user id instead of non-existent
        carrera: 'test',
        sector: 'test',
        areasInteres: [],
        apoyoOfrecido: []
      }
    }).catch(e => e);
    console.log('Create error full:', err);
  } catch(e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
