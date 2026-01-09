const { GeneGuard } = require('./packages/core-engine/dist/index.js');

const scanPath = process.argv[2] || './node_modules';

console.log(`🔍 Scanning ${scanPath} for suspicious patterns...\n`);

const guard = new GeneGuard(scanPath);
const findings = guard.run();

console.log(`\n📊 Found ${findings.length} suspicious patterns\n`);
console.log('─'.repeat(80));

if (findings.length === 0) {
  console.log('✅ No suspicious patterns detected!');
} else {
  findings.slice(0, 20).forEach((finding, i) => {
    console.log(`\n${i + 1}. File: ${finding.filePath}`);
    console.log(`   Pattern: ⚠️  ${finding.markerFound}`);
    console.log(`   Snippet: ${finding.snippet.substring(0, 100)}...`);
  });

  if (findings.length > 20) {
    console.log(`\n... and ${findings.length - 20} more findings.`);
    console.log('\nTo see all findings, modify the script or save to file.');
  }
}

console.log('\n' + '─'.repeat(80));
console.log(`\n✓ Scan complete. Checked files in: ${scanPath}\n`);
