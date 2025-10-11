import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const seedData = async () => {
  try {
    // Check if there are existing users
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial data...');
      
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin'
      });
      await admin.save();

      // Create employee user
      const employeePassword = await bcrypt.hash('employee123', 10);
      const employee = new User({
        name: 'John Employee',
        email: 'employee@example.com',
        password: employeePassword,
        role: 'employee'
      });
      await employee.save();

      // Create chef user
      const chefPassword = await bcrypt.hash('chef123', 10);
      const chef = new User({
        name: 'Chef User',
        email: 'chef@example.com',
        password: chefPassword,
        role: 'chef'
      });
      await chef.save();

      console.log('Initial data seeded');
    }
  } catch (error) {
    console.error('Seed data error:', error);
  }
};
