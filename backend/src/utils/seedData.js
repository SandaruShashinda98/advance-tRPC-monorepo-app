import { connectDB } from '../db.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { PERMISSIONS, PERMISSION_GROUPS } from './permissions.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Role.deleteMany({});
    await User.deleteMany({});

    console.log('Clearing existing data...');
    console.log('Seeding roles...');

    // Create user role
    const userRole = new Role({
      name: 'user',
      description: 'Basic user role',
      permissions: PERMISSION_GROUPS.USER_BASIC,
      isSystem: true
    });
    await userRole.save();
    console.log(`Created role: ${userRole.name} with ${userRole.permissions.length} permissions`);

    // Create moderator role
    const moderatorRole = new Role({
      name: 'moderator',
      description: 'Content moderator role',
      permissions: PERMISSION_GROUPS.MODERATOR,
      isSystem: true
    });
    await moderatorRole.save();
    console.log(`Created role: ${moderatorRole.name} with ${moderatorRole.permissions.length} permissions`);

    // Create admin role
    const adminRole = new Role({
      name: 'admin',
      description: 'System administrator role',
      permissions: PERMISSION_GROUPS.ADMIN,
      isSystem: true
    });
    await adminRole.save();
    console.log(`Created role: ${adminRole.name} with ${adminRole.permissions.length} permissions`);

    console.log('Seeding users...');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      age: 30,
      roles: [adminRole._id]
    });
    await adminUser.save();
    console.log(`Created admin user: ${adminUser.email}`);

    // Create regular user
    const regularUser = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'user123',
      age: 25,
      roles: [userRole._id]
    });
    await regularUser.save();
    console.log(`Created regular user: ${regularUser.email}`);

    // Create moderator user
    const moderatorUser = new User({
      name: 'Moderator User',
      email: 'moderator@example.com',
      password: 'mod123',
      age: 28,
      roles: [moderatorRole._id]
    });
    await moderatorUser.save();
    console.log(`Created moderator user: ${moderatorUser.email}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Default accounts:');
    console.log('👤 Admin: admin@example.com / admin123');
    console.log('👤 Moderator: moderator@example.com / mod123');
    console.log('👤 User: user@example.com / user123');

    console.log('\n🔐 Available permissions:');
    Object.entries(PERMISSION_GROUPS).forEach(([group, permissions]) => {
      console.log(`\n${group.toUpperCase()} (${permissions.length} permissions):`);
      permissions.forEach(p => console.log(`  ✓ ${p}`));
    });

    console.log(`\n📊 Total permissions defined: ${Object.keys(PERMISSIONS).length}`);
    console.log('🚀 Server is ready to start!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    console.log('\n🔍 Debug info:');
    console.log('PERMISSION_GROUPS.USER_BASIC:', PERMISSION_GROUPS.USER_BASIC);
    console.log('Type of first permission:', typeof PERMISSION_GROUPS.USER_BASIC[0]);
    process.exit(1);
  }
};

seedDatabase();