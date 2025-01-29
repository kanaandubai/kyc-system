import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@kyc.com' }
  });

  if (!existingAdmin) {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@kyc.com',
        password: hashedPassword,
        role: Role.ADMIN
      }
    });

    console.log('Admin user created:', admin);
  } else {
    console.log('Admin user already exists');
  }

  // Optionally add some test users
  const testUsers = [
    {
      email: 'user1@kyc.com',
      password: 'user123',
      role: Role.USER
    },
    {
      email: 'user2@kyc.com',
      password: 'user123',
      role: Role.USER
    }
  ];

  for (const user of testUsers) {
    const exists = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!exists) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword
        }
      });
      console.log(`Test user created: ${user.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });