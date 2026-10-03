/**
 * HospitalOS Automated Live Verification Suite
 * Verifies live system endpoints: Digital Twin, Auth, Queues, Beds, Departments, Encounters
 */

const BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

async function runVerification() {
  console.log('====================================================');
  console.log('   HospitalOS Automated System Verification Suite   ');
  console.log('====================================================');
  console.log(`Connecting to Backend API: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Digital Twin Real-Time State
  await test('GET /digital-twin/state (Live Operational Twin)', async () => {
    const res = await fetch(`${BASE_URL}/digital-twin/state`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.beds || !data.queues || !data.pharmacy) {
      throw new Error('Missing expected operational twin payload fields');
    }
  });

  // 2. Clinical Departments
  await test('GET /departments (Active Clinical Units)', async () => {
    const res = await fetch(`${BASE_URL}/departments`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Departments array is empty');
    }
  });

  // 3. Outpatient Queues
  await test('GET /queues (Live Queues with Waiting Tickets)', async () => {
    const res = await fetch(`${BASE_URL}/queues`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Queues array is empty');
    }
  });

  // 4. Inpatient Beds Matrix
  await test('GET /beds (Hospital Bed Matrix & Turnaround)', async () => {
    const res = await fetch(`${BASE_URL}/beds`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Beds array is invalid');
    }
  });

  // 5. Authentication & RBAC JWT Token
  let authToken = '';
  await test('POST /auth/login (Administrator Authentication)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hospitalos.org',
        password: 'Password123!',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    const token = data.accessToken || data.access_token;
    if (!token || data.user?.role !== 'ADMIN') {
      throw new Error('Invalid JWT access token or role mismatch');
    }
    authToken = token;
  });

  // 6. Authenticated Profile Inspection
  await test('GET /auth/profile (Verified Bearer Token)', async () => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.email !== 'admin@hospitalos.org') {
      throw new Error('User profile email does not match');
    }
  });

  // 7. Frontend Portal Health Check
  await test('GET http://localhost:3000 (Next.js Web Portal)', async () => {
    const res = await fetch('http://localhost:3000');
    if (!res.ok) throw new Error(`Status ${res.status}`);
  });

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
