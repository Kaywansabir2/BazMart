async function runAll() {
    console.log('====================================================');
    console.log('   BAZMART BACKEND & ERP SYNC AUTOMATED E2E TESTS   ');
    console.log('====================================================\n');
    let passed = 0;
    let failed = 0;
    globalThis.describe = (name, fn) => {
        console.log(`\nSUITE: ${name}`);
        fn();
    };
    const queue = [];
    globalThis.it = (name, fn) => {
        queue.push({ name, fn });
    };
    await Promise.resolve().then(() => require('./erp_sync.e2e-spec'));
    await Promise.resolve().then(() => require('./checkout_cod_fleet.e2e-spec'));
    for (const test of queue) {
        try {
            process.stdout.write(`  • RUNNING: ${test.name} ... `);
            await test.fn();
            console.log('✓ PASSED');
            passed++;
        }
        catch (err) {
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
//# sourceMappingURL=run_tests.js.map