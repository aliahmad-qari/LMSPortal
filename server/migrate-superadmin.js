require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

async function migrateSuperAdmins() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        console.log('Starting SuperAdmin migration...\n');

        // Find all SuperAdmin users
        const superAdmins = await User.find({ role: 'SUPER_ADMIN' });
        
        if (superAdmins.length === 0) {
            console.log('✅ No SuperAdmin users found. Migration not needed.');
            process.exit(0);
        }

        console.log(`Found ${superAdmins.length} SuperAdmin user(s):\n`);
        superAdmins.forEach(user => {
            console.log(`  - ${user.name} (${user.email})`);
        });

        console.log('\n⚠️  Choose migration option:');
        console.log('1. Convert SuperAdmin users to Admin role');
        console.log('2. Delete SuperAdmin users');
        console.log('\nFor automatic conversion, run: npm run migrate:superadmin convert');
        console.log('For deletion, run: npm run migrate:superadmin delete\n');

        // Check command line argument
        const action = process.argv[2];

        if (action === 'convert') {
            // Convert SuperAdmin to Admin
            const result = await User.updateMany(
                { role: 'SUPER_ADMIN' },
                { $set: { role: 'ADMIN' } }
            );
            console.log(`✅ Successfully converted ${result.modifiedCount} SuperAdmin user(s) to Admin role.`);
        } else if (action === 'delete') {
            // Delete SuperAdmin users
            const result = await User.deleteMany({ role: 'SUPER_ADMIN' });
            console.log(`✅ Successfully deleted ${result.deletedCount} SuperAdmin user(s).`);
        } else {
            console.log('❌ No action specified. Please run with "convert" or "delete" argument.');
            console.log('Example: npm run migrate:superadmin convert');
        }

        // Verify no SuperAdmin users remain
        const remainingSuperAdmins = await User.countDocuments({ role: 'SUPER_ADMIN' });
        if (remainingSuperAdmins === 0) {
            console.log('\n✅ Migration complete! No SuperAdmin users remain in the database.');
        } else {
            console.log(`\n⚠️  Warning: ${remainingSuperAdmins} SuperAdmin user(s) still exist.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration error:', err.message);
        process.exit(1);
    }
}

migrateSuperAdmins();
