import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    console.log(`Hashed password for: ${user.username}`);
  }
  await prisma.$disconnect();
}

main();