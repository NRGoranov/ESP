// Setup script to create .env file with Resend API key
const fs = require('fs');
const path = require('path');

const envContent = `# Database
DATABASE_URL="file:./dev.db"

# IBEX Price Source
OFFICIAL_PRICE_SOURCE_URL="https://ibex.bg/sdac-pv-en/"

# Resend Email Service
RESEND_API_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZjlkZGYzOWI3NDA1NGQ1NzU5N2UxMDQ2YTdhZTY3OGQ1ODg4ZmQ2Mjg5ZDM3NmE1NGUzYzQ2M2JkZmIyMzdiY2Q2NmY3OGQwNjBkYmQ2NzUiLCJpYXQiOjE3NjU2NDYzNzAuMzg2NjI2LCJuYmYiOjE3NjU2NDYzNzAuMzg2NjI5LCJleHAiOjQ5MjEzMTk5NzAuMzgxOTMzLCJzdWIiOiIxOTk4NDk3Iiwic2NvcGVzIjpbXX0.KcntIL9sU9QTsnKEHUZVEYtW0z4JJxkxTtYx-E-2DhyzJpK8u4M7u1eJcRhJNyIlapABzzPjKgftn5_f6_R0Bzsgb206ZOM1r8CdUiSUF_Ma1P1XM2_hBTimkLvnnKwvm0_jlWKAmgWW_l9Towp5ujh_Sob6cE6ZXN3WBYsIOvCRhyvpsWFDn4Im4YibWe0LxM7AXlRoO0Nm0KZytStqnD7pMhidJYU8vTWsNndGXWHLXUmPdl5Zq6lIy4s6BtNo6zI_T5QJp7IS89RhDn0kdd6DvZPVjG5a7hunhb_CWoLAuviOBlrrH5m018M4b66sUheSS4sju5lQSPRujkmsw_bswBp2IfM8BOgLl3TEXncycAabbsO8kdXVYY-X-OW6nCjbsYi-ijV5vNcqDiAzoeW4fdT8WSBcsAEE4gaHJtd8uelTbT8lmj8Ft25P9_havzwAjX3-OLlAURdw65eNInvshcBeHqlRVgZzIIOFY2qAQBWEAG7y_JK6OMcsh9I1gp7b1_wDZ7kdK0CM3AnRzjm_Ujim5Db77HFnIL0nH2uuq5gfew03fJsbvzGq2ykF4JR7zvJ_13IFva_1sn60b5vicHZHf3Wsqjbz0GwtzCNC-nS727L1bk9kyaS05GMU3cFM4aONPK6FaXfLzsADCnX4m9GRPmPKn2jPuZfwjqo"
RESEND_FROM_EMAIL="onboarding@resend.dev"
`;

const envPath = path.join(process.cwd(), '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Skipping creation.');
    console.log('   If you want to update it, please edit it manually.');
  } else {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env file created successfully!');
    console.log('   - Resend API key configured');
    console.log('   - IBEX price source URL configured');
    console.log('   - Database URL set to SQLite (dev.db)');
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

