// Simple test runner for BazMart backend e2e tests
async function runAll() {
  console.log('====================================================');
  console.log('   BAZMART BACKEND & ERP SYNC AUTOMATED E2E TESTS   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  (globalThis as any).describe = (name: string, fn: () => void) => {
    console.log(`\nSUITE: ${name}`);
    fn();
  };

  const queue: Array<{ name: string; fn: () => Promise<void> }> = [];

  (globalThis as any).it = (name: string, fn: () => Promise<void>) => {
    queue.push({ name, fn });
  };

  // Import test suites
  await import('./erp_sync.e2e-spec');
  await import('./checkout_cod_fleet.e2e-spec');

  // Execute sequentially
  for (const test of queue) {
    try {
      process.stdout.write(`  • RUNNING: ${test.name} ... `);
      await test.fn();
      console.log('✓ PASSED');
      passed++;
    } catch (err: any) {
      console.log('✗ FAILED');
      console.error('    Error:', err.message || err);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAll().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});

