# Política del Lenguaje

Course website for "Política del Lenguaje" (Language Policy) taught by J. P. Pérez-Tejada at ENAH.

🌐 **Live site**: https://politicadellenguaje.juanpaulo.xyz

## Table of Contents

- [Structure](#structure)
- [Running Locally](#running-locally)
- [Basic Quarto Commands](#basic-quarto-commands)
- [Testing](#testing)
- [Reference Linking](#reference-linking)
- [Deployment](#deployment)

## Structure

- **Root** (`/`): Static HTML/CSS landing page with course overview, objectives, and professor information
- **Course** (`/course/`): Quarto-based course content with lessons, presentations, and references

## Running Locally

### Prerequisites

- [Quarto CLI](https://quarto.org/docs/get-started/) installed
- Python 3.x (if using Jupyter notebooks)
- Modern web browser

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Maclenn77/politicadellenguage.juanpaulo.xyz.git
   cd politicadellenguage.juanpaulo.xyz
   ```

2. **View the landing page**

   Simply open `index.html` in your browser:
   ```bash
   # macOS
   open index.html

   # Linux
   xdg-open index.html

   # Windows
   start index.html
   ```

   Or use a local server (recommended):
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Then visit http://localhost:8000
   ```

3. **Run the Quarto course site**

   Navigate to the course folder and preview:
   ```bash
   cd course
   quarto preview
   ```

   This will:
   - Start a local server (usually at http://localhost:4200)
   - Automatically open your browser
   - Watch for changes and auto-reload

   To just render without preview:
   ```bash
   quarto render
   ```

### Full Local Setup

To run both the landing page and course site together:

1. **Terminal 1**: Start a server for the landing page
   ```bash
   # From repository root
   python3 -m http.server 8000
   ```

2. **Terminal 2**: Start Quarto preview for course content
   ```bash
   cd course
   quarto preview
   ```

3. **Access the site**:
   - Landing page: http://localhost:8000
   - Course content: http://localhost:8000/course (after running `quarto render` in the course folder)
   - Direct Quarto preview: http://localhost:4200

**Note**: When using `quarto preview`, you can access the course directly at the Quarto server URL, or render the course and access everything through the Python server.

## Basic Quarto Commands

| Command | Description |
|---------|-------------|
| `quarto preview` | Preview with live reload (recommended for development) |
| `quarto render` | Build static HTML files |
| `quarto publish` | Publish to GitHub Pages or other platforms |
| `quarto --help` | View all available commands |

For more information, see the [Quarto documentation](https://quarto.org/docs/guide/).

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

## Reference Linking

The course uses a custom reference system with interactive links and highlighting. All citations in the content files should link to the `references.html` page.

### Citation Format

When citing authors in your content files (`course/contenido/*.qmd`), use this format:

```markdown
Author ([Year](../references.html#AuthorYear))
```

**Examples:**

```markdown
Spolsky ([2004](../references.html#Spolsky2004))
Spolsky ([2004](../references.html#Spolsky2004), [2009](../references.html#Spolsky2009))
Spolsky ([2004](../references.html#Spolsky2004), p. 15)
```

**Important formatting rules:**
- Author name comes first (outside the parentheses)
- Year is wrapped in square brackets `[Year]`
- Link path is `../references.html#ReferenceID`
- Multiple years can be listed: `([2004](...), [2009](...))`
- Page numbers go after the link: `([2004](...), p. 15)`

### Adding References

1. **Add the reference entry** in `course/references.qmd`:

```markdown
:::{#AuthorYear}
Author, A. (Year). Title. Publisher.
:::
```

2. **Link to it** in your content files using the format above.

3. **Verify** all links work by running the reference checker (see below).

### Reference Checker Script

The repository includes a script to validate all citations and references:

```bash
cd course
npm run check-refs
```

Or run directly:
```bash
cd course
node check-references.js
```

**What it checks:**
- ✓ All linked citations exist in `references.qmd`
- ⚠️ Potential unlinked citations (citations without reference links)
- ✗ Missing references (citations link to non-existent references)
- 📋 Unused references (references that aren't cited anywhere)

**Output example:**
```
📚 Found 25 references in references.qmd
📄 Scanning 3 content files...

⚠️  01_que_es_politica_del_lenguaje.qmd
   Citations without links (may need verification):
     Line 50: Bourhis (1984)

═══════════════════════════════════════════════════════
                        SUMMARY
═══════════════════════════════════════════════════════

✓ Linked citations: 23
⚠ Potential unlinked citations: 1
✗ Missing references: 0
📋 Unused references: 4
```

**When to run it:**
- Before committing changes to content files
- After adding new citations
- When reviewing pull requests
- To identify unused references that can be removed

### Reference Features

The reference system includes several interactive features:

1. **Links open in new tabs** - All reference links automatically open with `target="_blank"` (except the navbar link)

2. **Smooth scrolling** - When clicking a reference link, the page scrolls smoothly to the reference

3. **Visual highlighting** - The referenced item is highlighted with:
   - Yellow background that fades after 3 seconds
   - Gold left border
   - Subtle shadow effect

4. **External link icons** - Reference links show a visual indicator (↗)

These features are implemented in:
- `course/references-links.html` - JavaScript for link behavior
- `course/styles.css` - CSS for highlighting animation

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

To deploy manually:

1. **Render the Quarto site**:
   ```bash
   cd course
   quarto render
   ```

2. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Update course content"
   ```

3. **Push to GitHub**:
   ```bash
   git push origin main
   ```

### GitHub Pages Setup

The site uses GitHub Pages with a custom domain. Configuration:

- **Source**: Deploy from `main` branch, root directory
- **Custom domain**: `politicadellenguaje.juanpaulo.xyz` (configured in `CNAME` file)
- **Landing page**: Static `index.html` and `style.css` at root
- **Course content**: Quarto-rendered site in `/course/` directory

Both the landing page and course content are served from the same domain, with the landing page linking to `/course/` for the full course materials.

---

## License

Materials are licensed under [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](http://creativecommons.org/licenses/by-nc/4.0/).

## Contact

For questions about the course, contact J. P. Pérez-Tejada via [juanpaulo.xyz](https://juanpaulo.xyz).

