import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "password123";
  const name = process.env.ADMIN_NAME || "Michael Shipman";
  const firmName = process.env.FIRM_NAME || "Shipman Law, LLC";

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hashedPassword, name, firmName },
  });

  console.log(`User created/found: ${user.email}`);
  console.log(`Login with: ${email} / ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
