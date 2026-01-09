import * as fs from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';

import { describe, it, expect } from 'vitest';

import { GeneGuard } from './GeneGuard';


describe('GeneGuard', () => {
  it('should initialize with root directory', () => {
    const guard = new GeneGuard('/tmp');
    expect(guard).toBeDefined();
  });

  it('should detect suspicious patterns in files', () => {
    // Create a temporary test directory
    const testDir = path.join(tmpdir(), 'geneguard-test-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });

    // Create a test file with suspicious content
    const testFile = path.join(testDir, 'suspicious.js');
    fs.writeFileSync(testFile, 'eval(atob("malicious code"));');

    try {
      const guard = new GeneGuard(testDir);
      const findings = guard.run();

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].markerFound).toBe('eval(atob(');
      expect(findings[0].filePath).toBe(testFile);
    } finally {
      // Cleanup
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should skip non-JS files', () => {
    const testDir = path.join(tmpdir(), 'geneguard-test-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });

    // Create a non-JS file with suspicious content
    const testFile = path.join(testDir, 'file.txt');
    fs.writeFileSync(testFile, 'eval(atob("this should be ignored"));');

    try {
      const guard = new GeneGuard(testDir);
      const findings = guard.run();

      expect(findings.length).toBe(0);
    } finally {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});
