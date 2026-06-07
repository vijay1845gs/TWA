const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Services:', await prisma.service.count());
  console.log('Customers:', await prisma.customer.count());
  console.log('Users:', await prisma.user.count());
}
main().finally(() => prisma.$disconnect());
