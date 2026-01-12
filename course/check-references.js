#!/usr/bin/env node

/**
 * Reference Checker Script
 *
 * This script checks for missing references in the course content.
 * It scans all .qmd files in course/contenido/ and validates that:
 * 1. All citations have links to references.html
 * 2. All cited references exist in references.qmd
 * 3. All references in references.qmd are cited at least once
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const contentDir = path.join(__dirname, 'contenido');
const referencesFile = path.join(__dirname, 'references.qmd');

// Extract all reference IDs from references.qmd
function getReferencesFromFile() {
  const content = fs.readFileSync(referencesFile, 'utf-8');
  // Match both ::: {#ID} and :::{#ID} patterns
  const referenceIdRegex = /:::\s*\{#(\w+)\}/g;
  const references = new Set();

  let match;
  while ((match = referenceIdRegex.exec(content)) !== null) {
    references.add(match[1]);
  }

  return references;
}

// Extract citations from a .qmd file
function extractCitationsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const citations = {
    linked: new Set(),      // Citations with links to references.html
    unlinked: [],           // Citations without links
  };

  // Pattern 1: Citations with links - Author ([Year](../references.html#AuthorYear))
  const linkedPattern = /\[(\d{4})\]\(\.\.\/references\.html#(\w+)\)/g;
  let match;
  while ((match = linkedPattern.exec(content)) !== null) {
    citations.linked.add(match[2]); // Add the reference ID
  }

  // Pattern 2: Author (Year) or Author, Year without links
  // This is more complex and may have false positives, but helps identify potential missing links
  const unlinkedPattern = /\b([A-Z][a-zá-ú]+(?:\s+(?:y|and|&)\s+[A-Z][a-zá-ú]+)?)\s*\((\d{4})\)/g;
  const linkCheckPattern = /\[(\d{4})\]\(\.\.\/references\.html#\w+\)/;

  // Split content into lines to check context
  const lines = content.split('\n');
  lines.forEach((line, lineNum) => {
    let lineMatch;
    const unlinkedRegex = new RegExp(unlinkedPattern);
    while ((lineMatch = unlinkedRegex.exec(line)) !== null) {
      const author = lineMatch[1];
      const year = lineMatch[2];
      const fullMatch = lineMatch[0];

      // Check if this citation has a link nearby (within 20 characters)
      const beforeContext = line.substring(Math.max(0, lineMatch.index - 5), lineMatch.index);
      const afterContext = line.substring(lineMatch.index, Math.min(line.length, lineMatch.index + fullMatch.length + 50));
      const context = beforeContext + afterContext;

      // Skip if it's part of a linked citation
      if (!linkCheckPattern.test(context)) {
        citations.unlinked.push({
          author,
          year,
          line: lineNum + 1,
          text: line.trim(),
        });
      }
    }
  });

  return citations;
}

// Get all .qmd files in contenido directory
function getContentFiles() {
  if (!fs.existsSync(contentDir)) {
    console.error(`${colors.red}Error: Content directory not found: ${contentDir}${colors.reset}`);
    process.exit(1);
  }

  return fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.qmd'))
    .map(file => path.join(contentDir, file));
}

// Main function
function main() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}         Reference Checker for Course Content          ${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Get all references from references.qmd
  const availableReferences = getReferencesFromFile();
  console.log(`${colors.blue}📚 Found ${availableReferences.size} references in references.qmd${colors.reset}\n`);

  // Get all content files
  const contentFiles = getContentFiles();
  console.log(`${colors.blue}📄 Scanning ${contentFiles.length} content files...${colors.reset}\n`);

  let totalLinked = 0;
  let totalUnlinked = 0;
  let missingReferences = new Set();
  const citedReferences = new Set();

  // Check each content file
  contentFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    const citations = extractCitationsFromFile(filePath);

    totalLinked += citations.linked.size;
    totalUnlinked += citations.unlinked.length;

    // Track which references are cited
    citations.linked.forEach(ref => citedReferences.add(ref));

    // Check for missing references
    const missing = [...citations.linked].filter(ref => !availableReferences.has(ref));

    if (missing.length > 0 || citations.unlinked.length > 0) {
      console.log(`${colors.yellow}⚠️  ${fileName}${colors.reset}`);

      if (missing.length > 0) {
        console.log(`   ${colors.red}Missing references in references.qmd:${colors.reset}`);
        missing.forEach(ref => {
          console.log(`     - ${ref}`);
          missingReferences.add(ref);
        });
      }

      if (citations.unlinked.length > 0) {
        console.log(`   ${colors.yellow}Citations without links (may need verification):${colors.reset}`);
        citations.unlinked.forEach(citation => {
          console.log(`     Line ${citation.line}: ${citation.author} (${citation.year})`);
        });
      }
      console.log('');
    }
  });

  // Find unused references
  const unusedReferences = [...availableReferences].filter(ref => !citedReferences.has(ref));

  // Summary
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}                        SUMMARY                         ${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.green}✓ Linked citations: ${totalLinked}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Potential unlinked citations: ${totalUnlinked}${colors.reset}`);
  console.log(`${colors.red}✗ Missing references: ${missingReferences.size}${colors.reset}`);
  console.log(`${colors.magenta}📋 Unused references: ${unusedReferences.length}${colors.reset}\n`);

  if (missingReferences.size > 0) {
    console.log(`${colors.red}Missing references that need to be added to references.qmd:${colors.reset}`);
    missingReferences.forEach(ref => console.log(`  - ${ref}`));
    console.log('');
  }

  if (unusedReferences.length > 0) {
    console.log(`${colors.magenta}Unused references (exist in references.qmd but not cited):${colors.reset}`);
    unusedReferences.forEach(ref => console.log(`  - ${ref}`));
    console.log('');
  }

  // Exit code
  if (missingReferences.size > 0) {
    console.log(`${colors.red}❌ Check failed: Missing references found${colors.reset}\n`);
    process.exit(1);
  } else if (totalUnlinked > 0) {
    console.log(`${colors.yellow}⚠️  Warning: Potential unlinked citations found (manual verification recommended)${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}✅ All checks passed!${colors.reset}\n`);
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { getReferencesFromFile, extractCitationsFromFile };
