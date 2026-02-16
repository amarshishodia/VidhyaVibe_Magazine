#!/bin/bash

# Create admin user via registration API
echo "🔐 Creating admin user via API..."

curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@magazine.com",
    "password": "admin123",
    "name": "Admin User",
    "phone": "555-0000",
    "guardians": [
      {
        "name": "Admin Guardian",
        "phone": "555-0001",
        "relation": "Self"
      }
    ]
  }'

echo ""
echo ""
echo "✅ Admin user created!"
echo "📋 Login credentials:"
echo "   Email: admin@magazine.com"
echo "   Password: admin123"
echo ""
echo "🔧 Setting admin flag..."

# Set admin flag using Prisma
pnpm --filter @magazine/db exec ts-node --transpile-only -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.\$executeRaw\`UPDATE users SET is_admin = 1 WHERE email = 'admin@magazine.com'\`
  .then(() => { 
    console.log('✅ Admin flag set');
    return prisma.\$disconnect();
  })
  .catch(e => { 
    console.error('Error:', e.message);
    process.exit(1);
  });
"

echo ""
echo "🎉 Done! You can now log in at http://localhost:3001/login"
