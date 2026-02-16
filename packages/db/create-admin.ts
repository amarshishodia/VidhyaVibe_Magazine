import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔐 Creating admin user with password...');

    try {
        // Find or create admin user
        let adminUser = await prisma.user.findFirst({
            where: { email: 'admin@magazine.com' }
        });

        if (!adminUser) {
            console.log('Admin user not found, checking for user1@example.com...');
            adminUser = await prisma.user.findFirst({
                where: { email: 'user1@example.com' }
            });
        }

        if (!adminUser) {
            console.log('No existing users found. Creating new admin user...');

            // Create guardian first
            const guardian = await prisma.guardian.create({
                data: {
                    name: 'Admin Guardian',
                    phone: '555-0000',
                    relation: 'Self',
                    user: {
                        create: {
                            email: 'admin@magazine.com',
                            name: 'Admin User',
                            phone: '555-0001',
                            isAdmin: true,
                        },
                    },
                },
                include: {
                    user: true,
                },
            });

            // Update user to set primaryGuardianId
            adminUser = await prisma.user.update({
                where: { id: guardian.user.id },
                data: { primaryGuardianId: guardian.id },
            });

            console.log(`✅ Created new admin user: ${adminUser.email}`);
        } else {
            // Update existing user to be admin
            adminUser = await prisma.user.update({
                where: { id: adminUser.id },
                data: { isAdmin: true },
            });
            console.log(`✅ Found existing user: ${adminUser.email} (updated to admin)`);
        }

        // Now create password using raw SQL (since user_auth table is not in Prisma schema)
        const password = 'admin123';
        const passwordHash = await bcrypt.hash(password, 10);

        // Use raw SQL to interact with user_auth table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_auth (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNIQUE,
        password_hash VARCHAR(255),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Check if password exists
        const existing: any[] = await prisma.$queryRaw`
      SELECT id FROM user_auth WHERE user_id = ${adminUser.id} LIMIT 1
    `;

        if (existing.length > 0) {
            // Update password
            await prisma.$executeRaw`
        UPDATE user_auth SET password_hash = ${passwordHash} WHERE user_id = ${adminUser.id}
      `;
            console.log('✅ Updated password for admin user');
        } else {
            // Insert password
            await prisma.$executeRaw`
        INSERT INTO user_auth (user_id, password_hash) VALUES (${adminUser.id}, ${passwordHash})
      `;
            console.log('✅ Created password for admin user');
        }

        console.log('\n📋 Admin Credentials:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Password: ${password}`);
        console.log(`   User ID: ${adminUser.id}`);
        console.log(`   Is Admin: ${adminUser.isAdmin}`);
        console.log('\n🎉 You can now log in to the admin panel at http://localhost:3001/login');

    } catch (error) {
        console.error('❌ Failed to create admin user:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
