// prisma/seed.ts
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Default password for all demo users: "password123"
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      name: "Alice Founder",
      email: "alice@example.com",
      password: hashedPassword,
      role: "founder" as UserRole,
    },
    {
      name: "Bob Expert",
      email: "bob@example.com",
      password: hashedPassword,
      role: "expert" as UserRole,
    },
    {
      name: "Carla Community",
      email: "carla@example.com",
      password: hashedPassword,
      role: "admin" as UserRole,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  console.log("Seeded users with password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
