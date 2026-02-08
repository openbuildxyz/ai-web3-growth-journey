import prisma from './db.js';

async function seed() {
  console.log('🌱 开始初始化数据库...');

  try {
    // 创建 demo 用户
    const user = await prisma.user.upsert({
      where: { username: 'demo_user' },
      update: {},
      create: {
        username: 'demo_user',
        currentCash: 100000
      }
    });

    console.log('✅ Demo 用户创建成功:', user.username);
    console.log('💰 初始资金:', user.currentCash.toString());

    console.log('✅ 数据库初始化完成!');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
