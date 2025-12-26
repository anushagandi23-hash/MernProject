require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

async function setupAdminRole() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    // Find admin user by email
    const adminUser = await User.findOne({
      where: { email: 'admin-cba@gmail.com' } // Change to your admin email
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Check the email address.');
      process.exit(1);
    }

    // Update role to ADMIN
    adminUser.role = 'ADMIN';
    await adminUser.save();

    console.log('✅ Admin role assigned successfully!');
    console.log('User:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdminRole();
