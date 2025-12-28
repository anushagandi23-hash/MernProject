const sequelize = require('./config/database');
const User = require('./models/User');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role']
    });

    console.log('📋 All Users in Database:');
    users.forEach(u => {
      console.log(`   ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });

    console.log(`\nTotal users: ${users.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
