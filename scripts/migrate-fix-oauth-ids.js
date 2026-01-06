/**
 * MIGRATION: Fix OAuth users with email-format IDs
 * 
 * This script will:
 * 1. Find all users with email-format IDs (contains @)
 * 2. Delete them (they can re-login to get proper IDs)
 * 
 * Run this ONCE: node scripts/migrate-fix-oauth-ids.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateOAuthUsers() {
    console.log('🔍 Starting OAuth user ID migration...\n');

    // Find all users
    const allUsers = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            plan: true,
            creditsUsed: true
        }
    });

    // Find users where ID is an email (contains @)
    const brokenUsers = allUsers.filter(user => user.id.includes('@'));

    if (brokenUsers.length === 0) {
        console.log('✅ No broken users found! Migration not needed.');
        await prisma.$disconnect();
        return;
    }

    console.log(`⚠️  Found ${brokenUsers.length} users with email-format IDs:\n`);
    brokenUsers.forEach(user => {
        console.log(`   📧 ${user.email}`);
        console.log(`      Current ID: ${user.id}`);
        console.log(`      Plan: ${user.plan} | Credits Used: ${user.creditsUsed}\n`);
    });

    console.log('🗑️  Deleting broken users...\n');

    for (const user of brokenUsers) {
        try {
            // Delete related records first (foreign key constraints)
            await prisma.loginHistory.deleteMany({ where: { userId: user.id } });
            await prisma.resumeLog.deleteMany({ where: { userId: user.id } });
            await prisma.systemActivity.deleteMany({ where: { userId: user.id } });
            await prisma.feedback.deleteMany({ where: { userId: user.id } });

            // Now delete the user
            await prisma.user.delete({ where: { id: user.id } });

            console.log(`   ✅ Deleted: ${user.email}`);
        } catch (error) {
            console.error(`   ❌ Failed to delete ${user.email}:`, error.message);
        }
    }

    console.log('\n✅ Migration complete!');
    console.log('📝 Users can now log in again with Google OAuth.');
    console.log('   They will be created with proper cuid() IDs.\n');

    await prisma.$disconnect();
}

migrateOAuthUsers()
    .catch(error => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
