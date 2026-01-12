# Courses Template

This repository serves as a template for creating webpages for courses using Quarteto. 

## Structure

- **Root**: The landing page for the course.
- **Course**: Each course is structured as a Quarteto project.

## Basic Quarto Commands

- `quarto render`: Render the document to the specified output format (HTML, PDF, etc.).
- `quarto preview`: Preview the document in a web browser.
- `quarto publish`: Publish the document to a remote server or repository.
- `quarto create-project`: Create a new Quarto project.

## Testing

The course includes end-to-end tests using [Playwright](https://playwright.dev/) to ensure critical functionality works correctly.

### Setup

1. Install dependencies:
```bash
cd course
npm install
```

2. Install Playwright browsers (first time only):
```bash
npx playwright install
```

### Running Tests

**Fast (recommended for local development):**
```bash
# Run tests in Chromium only (default, fastest)
npm test

# Run tests with UI (even faster for debugging)
npm run test:ui
```

**Other options:**
```bash
# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests step-by-step
npm run test:debug

# Explicitly run only in Chromium
npm run test:chromium

# Run in all browsers (slow, matches CI)
npm run test:all-browsers
```

**Why are tests slow?**

By default, tests run only in **Chromium** on your local machine for speed. In CI, they run in **3 browsers** (Chromium, Firefox, WebKit) for comprehensive coverage, which takes ~3x longer.

Other factors that affect speed:
- **First run**: Quarto needs to compile the entire site (can take 30-60s)
- **Subsequent runs**: Much faster (~10-20s) as Quarto reuses the running server
- **All browsers**: Using `npm run test:all-browsers` triples execution time

### Test Coverage

The tests verify:

1. **Reference links with hash open in new window** - Links to specific references (e.g., `references.html#Spolsky2009`) open with `target="_blank"`

2. **Navbar links don't open in new window** - The "Bibliografía" link in the navbar should not have `target="_blank"`

3. **Reference highlighting** - When visiting a URL with hash, the referenced element should:
   - Be visible in viewport
   - Have a highlighted background
   - Have a gold left border
   - Scroll smoothly to the element

4. **Visual indicator** - Reference links show an external link icon (↗)

### View Test Results

After running tests:
```bash
npx playwright show-report
```

### Continuous Integration

Tests run automatically on every pull request via GitHub Actions. The workflow:

1. Sets up Node.js and Quarto
2. Installs dependencies and Playwright browsers
3. Runs all tests
4. Uploads test reports as artifacts

**Pull requests must pass all tests before merging.** You can view test results in the "Actions" tab of the repository or in the PR checks.

If tests fail in CI:
- Review the test output in the GitHub Actions logs
- Download the test report artifact for detailed analysis
- Run tests locally to debug: `cd course && npm test`

Feel free to customize the template to suit your course needs!

