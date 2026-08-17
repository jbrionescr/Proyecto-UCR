import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const emailsToDelete = [
  'dchavarriafwdcostarica@gmail.com',
  'agrajalfwdcostarica@gmail.com',
  'alealvfwd@ucr.ac.cr',
  'alealvfwd@gmail.com',
  'andresgerardolv@gmail.com'
];

async function deleteUsers() {
  for (const email of emailsToDelete) {
    try {
      await prisma.user.delete({ where: { email: email.toLowerCase() } });
      console.log(`- Borrado de BD Frontend (Prisma User): ${email}`);
    } catch (e) {
      if (e.code === 'P2025') {
        console.log(`- No encontrado en BD Frontend (Prisma User): ${email}`);
      } else {
        console.error(`- Error borrando de Prisma para ${email}:`, e.message);
      }
    }
  }
}

deleteUsers().catch(console.error).finally(() => prisma.$disconnect());
