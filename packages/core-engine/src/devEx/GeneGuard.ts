import * as fs from 'fs';
import * as path from 'path';

interface ScanResult {
  filePath: string;
  markerFound: string;
  snippet: string;
}

export class GeneGuard {
  private suspiciousGenes = [
    'eval(atob(',            
    'process.env["AWS_KEY"]', 
    'child_process.exec(',    
  ];

  constructor(private rootDir: string) {}

  public run(): ScanResult[] {
    const findings: ScanResult[] = [];
    
 
    const stack: string[] = [this.rootDir];

    while (stack.length > 0) {
      const currentPath = stack.pop()!; 
      
      try {
        const stats = fs.statSync(currentPath);

        if (stats.isDirectory()) {
          const children = fs.readdirSync(currentPath);
          children.forEach((child: string) => {
             if (child !== '.git' && child !== '.bin') {
                 stack.push(path.join(currentPath, child));
             }
          });
        } else if (stats.isFile() && currentPath.endsWith('.js')) {
          const result = this.scanFile(currentPath);
          if (result) findings.push(result);
        }
      } catch {
        // Silently skip files we can't read
      }
    }

    return findings;
  }

 
  private scanFile(filePath: string): ScanResult | null {
    const content = fs.readFileSync(filePath, 'utf-8'); 
    
  
    
    for (const gene of this.suspiciousGenes) {
      if (this.containsGene(content, gene)) {
        return {
          filePath,
          markerFound: gene,
          snippet: this.extractSnippet(content, gene)
        };
      }
    }

    return null;
  }

  
  private containsGene(text: string, pattern: string): boolean {
    const windowSize = pattern.length;
    
    for (let i = 0; i <= text.length - windowSize; i++) {
      if (text[i] !== pattern[0] || text[i + windowSize - 1] !== pattern[windowSize - 1]) {
        continue; 
      }

      let match = true;
      for (let j = 0; j < windowSize; j++) {
        if (text[i + j] !== pattern[j]) {
          match = false;
          break;
        }
      }

      if (match) return true;
    }
    
    return false;
  }

  private extractSnippet(content: string, gene: string): string {
    const idx = content.indexOf(gene);
    const start = Math.max(0, idx - 20);
    const end = Math.min(content.length, idx + gene.length + 20);
    return content.substring(start, end).replace(/\n/g, ' '); 
  }
}

