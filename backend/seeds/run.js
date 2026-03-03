require('dotenv').config();
const { sequelize } = require('../src/config/database');
const { User, ServiceType } = require('../src/models');
const logger = require('../src/utils/logger');

async function seed() {
  try {
    await sequelize.authenticate();
    logger.info('Connected to database');

    logger.info('Creating service types...');
    await ServiceType.bulkCreate([
      { title: 'Справка об обучении', avgServiceTime: 300 },
      { title: 'Академический отпуск', avgServiceTime: 600 },
      { title: 'Перевод на другую специальность', avgServiceTime: 900 },
      { title: 'Изменение учебного плана', avgServiceTime: 450 },
      { title: 'Консультация', avgServiceTime: 300 },
      { title: 'Прочие вопросы', avgServiceTime: 400 }
    ], {
      ignoreDuplicates: true  
    });

    logger.info('Creating users...');
    const users = await User.bulkCreate([
      {
        username: 'admin@alatoo.edu.kg',
        password: 'Admin123!',
        fullName: 'System Administrator',
        role: 'admin',
        isActive: true,
        isVerified: true
      },
      {
        username: 'staff1@alatoo.edu.kg',
        password: 'Staff123!',
        fullName: 'Staff Member One',
        role: 'staff',
        isActive: true,
        isVerified: true
      },
      {
        username: 'staff2@alatoo.edu.kg',
        password: 'Staff123!',
        fullName: 'Staff Member Two',
        role: 'staff',
        isActive: true,
        isVerified: true
      }
    ], {
      individualHooks: true,  
      ignoreDuplicates: true
    });

    logger.info(`Created ${users.length} users`);
    logger.info('');
    logger.info('Seeding completed!');
    logger.info('Credentials:');
    logger.info('  Admin: admin@alatoo.edu.kg / Admin123!');
    logger.info('  Staff: staff1@alatoo.edu.kg / Staff123!');

    process.exit(0);

  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();