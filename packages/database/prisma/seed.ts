import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const adminEmail = 'admin@easyx.local';
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
      },
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Create default system settings
  const defaultSettings = [
    { key: 'fees.withdrawal.BTC', value: { amount: '0.0001', type: 'fixed' } },
    { key: 'fees.withdrawal.LTC', value: { amount: '0.001', type: 'fixed' } },
    { key: 'fees.withdrawal.USDT_TRC20', value: { amount: '1', type: 'fixed' } },
    { key: 'fees.withdrawal.USDT_ERC20', value: { amount: '5', type: 'fixed' } },
    { key: 'fees.swap', value: { percentage: '0.5' } },
    { key: 'limits.withdrawal.daily', value: { BTC: '1', LTC: '100', USDT_TRC20: '10000', USDT_ERC20: '10000' } },
    { key: 'limits.withdrawal.min', value: { BTC: '0.0001', LTC: '0.01', USDT_TRC20: '1', USDT_ERC20: '10' } },
    { key: 'rates.margin', value: { percentage: '1.5' } },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
    console.log(`Upserted setting: ${setting.key}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
