import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = 12;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  console.log('\n--- 🛡️ CampusOS Admin Bootstrap ---\n');

  try {
    const name = await question('Admin Name (e.g., Campus Admin): ');
    const email = await question('Admin Email (e.g., admin@campusos.edu): ');
    const password = await question('Admin Password (min 8 chars): ');

    if (!name || !email || !password) {
      console.error('\n❌ Error: All fields are required.');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('\n❌ Error: Password must be at least 8 characters long.');
      process.exit(1);
    }

    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (existingAdmin) {
      console.error('\n❌ Error: An account with this email already exists.');
      process.exit(1);
    }

    console.log('\nGenerating secure hash...');
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    console.log('Creating admin in database...');
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    console.log('\n✅ Success! Super Admin account created.');
    console.log(`- ID: ${admin.id}`);
    console.log(`- Name: ${admin.name}`);
    console.log(`- Email: ${admin.email}`);
    console.log('\nYou can now log in at /admin/login\n');
  } catch (error) {
    console.error('\n❌ Error creating admin:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
