/**
 * SupLab Backend API Test Suite
 *
 * Automatically tests the /api/analyze endpoint with various payloads.
 * Run with: node tests/api.test.js
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const ANALYZE_ENDPOINT = `${API_BASE_URL}/api/analyze`;
const HEALTH_ENDPOINT = `${API_BASE_URL}/api/health`;

// ============================================================
// TEST PAYLOADS
// ============================================================

const testCases = [
  {
    name: 'Sequence only - Alternating harmonic',
    payload: {
      components: [
        {
          type: 'sequence',
          formula: '(-1)^n / n',
          start: 1,
          end: 100
        }
      ]
    },
    expectedBoundedAbove: true,
    expectedBoundedBelow: true
  },
  {
    name: 'Interval only - Closed interval',
    payload: {
      components: [
        {
          type: 'interval',
          start: -2,
          end: 5,
          openStart: false,
          openEnd: false
        }
      ]
    },
    expectedBoundedAbove: true,
    expectedBoundedBelow: true,
    expectedSup: 5,
    expectedInf: -2,
    expectedMax: 5,
    expectedMin: -2
  },
  {
    name: 'Interval only - Open at end (max should be null)',
    payload: {
      components: [
        {
          type: 'interval',
          start: 0,
          end: 1,
          openStart: false,
          openEnd: true
        }
      ]
    },
    expectedBoundedAbove: true,
    expectedBoundedBelow: true,
    expectedSup: 1,
    expectedInf: 0,
    expectedMax: null,
    expectedMin: 0
  },
  {
    name: 'Interval only - Open at start (min should be null)',
    payload: {
      components: [
        {
          type: 'interval',
          start: 0,
          end: 1,
          openStart: true,
          openEnd: false
        }
      ]
    },
    expectedBoundedAbove: true,
    expectedBoundedBelow: true,
    expectedSup: 1,
    expectedInf: 0,
    expectedMax: 1,
    expectedMin: null
  },
  {
    name: 'Combined - Sequence and interval',
    payload: {
      components: [
        {
          type: 'sequence',
          formula: '(-1)^n / n',
          start: 1,
          end: 1000
        },
        {
          type: 'interval',
          start: -2,
          end: 5,
          openStart: false,
          openEnd: true
        }
      ]
    },
    expectedBoundedAbove: true,
    expectedBoundedBelow: true,
    expectedSup: 5,
    expectedInf: -2,
    expectedMax: null,
    expectedMin: -2
  },
  {
    name: 'Sequence - Harmonic (1/n)',
    payload: {
      components: [
        {
          type: 'sequence',
          formula: '1/n',
          start: 1,
          end: 1000
        }
      ]
    },
    expectedBoundedAbove: true,
    expectedBoundedBelow: true
  },
  {
    name: 'Sequence - Sine function',
    payload: {
      components: [
        {
          type: 'sequence',
          formula: 'sin(n)',
          start: 1,
          end: 100
        }
      ]
    },
    expectedBoundedAbove: true,
    expectedBoundedBelow: true
  },
  {
    name: 'Multiple intervals',
    payload: {
      components: [
        {
          type: 'interval',
          start: 0,
          end: 2,
          openStart: false,
          openEnd: false
        },
        {
          type: 'interval',
          start: 5,
          end: 10,
          openStart: true,
          openEnd: true
        }
      ]
    },
    expectedBoundedAbove: true,
    expectedBoundedBelow: true,
    expectedSup: 10,
    expectedInf: 0,
    expectedMax: null,
    expectedMin: 0
  }
];

// Invalid payloads for error handling tests
const invalidTestCases = [
  {
    name: 'Empty components array',
    payload: { components: [] },
    expectedStatus: 400
  },
  {
    name: 'Missing components field',
    payload: {},
    expectedStatus: 400
  },
  {
    name: 'Invalid component type',
    payload: {
      components: [
        { type: 'invalid', start: 1, end: 10 }
      ]
    },
    expectedStatus: 400
  },
  {
    name: 'Sequence with missing formula',
    payload: {
      components: [
        { type: 'sequence', start: 1, end: 10 }
      ]
    },
    expectedStatus: 400
  },
  {
    name: 'Interval with missing openStart',
    payload: {
      components: [
        { type: 'interval', start: 0, end: 1, openEnd: false }
      ]
    },
    expectedStatus: 400
  }
];

// ============================================================
// TEST UTILITIES
// ============================================================

/**
 * Makes a POST request to the analyze endpoint
 */
async function sendAnalyzeRequest(payload) {
  const response = await fetch(ANALYZE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
}

/**
 * Validates the response structure
 */
function validateResponseStructure(data) {
  const requiredFields = [
    { name: 'boundedAbove', type: 'boolean' },
    { name: 'boundedBelow', type: 'boolean' },
    { name: 'sup', type: ['number', 'object'] },  // can be null
    { name: 'inf', type: ['number', 'object'] },  // can be null
    { name: 'max', type: ['number', 'object'] },  // can be null
    { name: 'min', type: ['number', 'object'] },  // can be null
    { name: 'epsilonBand', type: ['object'] }
  ];

  const errors = [];

  for (const field of requiredFields) {
    if (!(field.name in data)) {
      errors.push(`Missing required field: ${field.name}`);
      continue;
    }

    const value = data[field.name];
    const types = Array.isArray(field.type) ? field.type : [field.type];
    const actualType = typeof value;

    if (!types.includes(actualType)) {
      errors.push(`Field "${field.name}" has wrong type: expected ${types.join(' or ')}, got ${actualType}`);
    }
  }

  // Validate epsilonBand structure if it exists
  if (data.epsilonBand !== null && typeof data.epsilonBand === 'object') {
    if (!('epsilon' in data.epsilonBand)) {
      errors.push('epsilonBand missing "epsilon" field');
    }
    if (!('interval' in data.epsilonBand)) {
      errors.push('epsilonBand missing "interval" field');
    } else if (!Array.isArray(data.epsilonBand.interval)) {
      errors.push('epsilonBand.interval should be an array');
    } else if (data.epsilonBand.interval.length !== 2) {
      errors.push('epsilonBand.interval should have exactly 2 elements');
    }
  }

  return errors;
}

/**
 * Validates expected values against actual response
 */
function validateExpectedValues(data, testCase) {
  const errors = [];

  if (testCase.expectedSup !== undefined && data.sup !== testCase.expectedSup) {
    errors.push(`sup: expected ${testCase.expectedSup}, got ${data.sup}`);
  }
  if (testCase.expectedInf !== undefined && data.inf !== testCase.expectedInf) {
    errors.push(`inf: expected ${testCase.expectedInf}, got ${data.inf}`);
  }
  if (testCase.expectedMax !== undefined && data.max !== testCase.expectedMax) {
    errors.push(`max: expected ${testCase.expectedMax}, got ${data.max}`);
  }
  if (testCase.expectedMin !== undefined && data.min !== testCase.expectedMin) {
    errors.push(`min: expected ${testCase.expectedMin}, got ${data.min}`);
  }
  if (testCase.expectedBoundedAbove !== undefined && data.boundedAbove !== testCase.expectedBoundedAbove) {
    errors.push(`boundedAbove: expected ${testCase.expectedBoundedAbove}, got ${data.boundedAbove}`);
  }
  if (testCase.expectedBoundedBelow !== undefined && data.boundedBelow !== testCase.expectedBoundedBelow) {
    errors.push(`boundedBelow: expected ${testCase.expectedBoundedBelow}, got ${data.boundedBelow}`);
  }

  return errors;
}

// ============================================================
// TEST RUNNER
// ============================================================

async function checkHealth() {
  try {
    const response = await fetch(HEALTH_ENDPOINT);
    const data = await response.json();
    return response.ok && data.status === 'ok';
  } catch (error) {
    return false;
  }
}

async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║           SupLab Backend API Test Suite                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`🔗 API URL: ${API_BASE_URL}\n`);

  // Check if server is running
  console.log('📡 Checking server health...');
  const isHealthy = await checkHealth();

  if (!isHealthy) {
    console.log('\n❌ ERROR: Server is not responding!');
    console.log('\n🔧 Potential fixes:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Check if port 3001 is available');
    console.log('   3. Verify the API_URL environment variable');
    process.exit(1);
  }

  console.log('✅ Server is healthy\n');
  console.log('─'.repeat(60));

  let passed = 0;
  let failed = 0;

  // Run valid test cases
  console.log('\n📋 VALID PAYLOAD TESTS\n');

  for (const testCase of testCases) {
    process.stdout.write(`Testing: ${testCase.name}... `);

    try {
      const { status, ok, data } = await sendAnalyzeRequest(testCase.payload);

      if (!ok) {
        console.log('❌ FAILED');
        console.log(`   Status: ${status}`);
        console.log(`   Error: ${JSON.stringify(data)}`);
        failed++;
        continue;
      }

      // Validate response structure
      const structureErrors = validateResponseStructure(data);
      if (structureErrors.length > 0) {
        console.log('❌ FAILED');
        console.log(`   Structure errors: ${structureErrors.join(', ')}`);
        failed++;
        continue;
      }

      // Validate expected values
      const valueErrors = validateExpectedValues(data, testCase);
      if (valueErrors.length > 0) {
        console.log('❌ FAILED');
        console.log(`   Value errors: ${valueErrors.join(', ')}`);
        failed++;
        continue;
      }

      console.log('✅ PASSED');
      passed++;

    } catch (error) {
      console.log('❌ FAILED');
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }

  // Run invalid test cases
  console.log('\n📋 ERROR HANDLING TESTS\n');

  for (const testCase of invalidTestCases) {
    process.stdout.write(`Testing: ${testCase.name}... `);

    try {
      const { status } = await sendAnalyzeRequest(testCase.payload);

      if (status === testCase.expectedStatus) {
        console.log('✅ PASSED');
        passed++;
      } else {
        console.log('❌ FAILED');
        console.log(`   Expected status ${testCase.expectedStatus}, got ${status}`);
        failed++;
      }

    } catch (error) {
      console.log('❌ FAILED');
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`   Total:  ${passed + failed}`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
  console.log();

  if (failed === 0) {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     ✅ API works correctly with frontend!                 ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    process.exit(0);
  } else {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     ❌ Some tests failed. See details above.              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log('🔧 Potential fixes:');
    console.log('   1. Check the backend logs for errors');
    console.log('   2. Verify the API response format matches the schema');
    console.log('   3. Ensure all required fields are returned');
    console.log('   4. Check the math logic in analyze.service.ts');
    console.log();
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

