# Standard Library Documentation Generator

This script generates the `standard-library.mdx` file from the JSON data in `resources/standard-library/doc_out.json`.

## Usage

To regenerate the standard library documentation after updating `doc_out.json`:

```bash
npm run generate:stdlib
```

Or run directly:

```bash
node scripts/generate-stdlib-docs.js
```

## How it works

The script reads the JSON file containing all the standard library functions and generates a proper MDX file with:
- Function categories (Global Utility, Array, String, etc.)
- Function signatures
- Gas costs
- Descriptions
- Examples (when available)

This approach ensures the documentation is always in sync with the JSON source while maintaining proper MDX format for Nextra.
