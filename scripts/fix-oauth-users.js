/**
 * This script fixes old Google OAuth users who were created with email as ID
 * Run this ONCE to migrate old users to proper cuid() IDs
 * 
 * Usage: node scripts/fix-oauth-users.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOAuthUsers() {
    console.log('🔍 Finding users with email-format IDs...');

    // Find all users
    const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true }
    });

    console.log(`📊 Total users: ${allUsers.length}`);

    // Find users where ID is an email (contains @)
    const brokenUsers = allUsers.filter(user => user.id.includes('@'));

    if (brokenUsers.length === 0) {
        console.log('✅ No broken users found! All users have proper IDs.');
        return;
    }

    console.log(`⚠️  Found ${brokenUsers.length} users with email-format IDs:`);
    brokenUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
    });

    console.log('\n⚠️  WARNING: These users need to be recreated with proper IDs.');
    console.log('⚠️  This will require them to log in again.');
    console.log('\n💡 To fix: Delete these users and let them re-login with Google OAuth.');
    console.log('   The new auth code will create them with proper cuid() IDs.\n');

    // Uncomment below to auto-delete and recreate
    // for (const user of brokenUsers) {
    //     console.log(`🗑️  Deleting user: ${user.email}`);
    //     await prisma.user.delete({ where: { id: user.id } });
    // }
    // console.log('✅ Old users deleted. They can now re-login to get proper IDs.');
}

fixOAuthUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
