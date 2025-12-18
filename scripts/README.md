# Standard Library Documentation Generator

`1.update-doc-out.mjs` updates the `resources/standard-library/doc_out.json` by taking the latest JSON data from `resources/standard-library/std_lib_data.json`, which is the latest syscall IDs, gas costs, and function signatures. For now, this data is created in the playground console, but in the future will pulled in automatically, so the `std_lib_data.json` file will not be needed.

`2.check-missing-values.mjs` provides a quick report on signatures in `doc_out.json` that were not updated, or new signatures that were added by `std_lib_data.json`. Sometimes it is just the signature that changed, so you can manually update the `doc_out.json` file. Use this script on the first run to see what needs to be updated.

`3.verify-docs.mjs` verifies that all signatures in `std_lib_data.json` are present in `doc_out.json`.

`4.generate-stdlib-docs-mdx.mjs` generates the `standard-library.mdx` file from the JSON data in `resources/standard-library/doc_out.json`.
## Usage

To regenerate the standard library documentation after updating `doc_out.json` and fetching `std_lib_data.json`, run the scripts as ordered (1 - 4):

```bash
node scripts/1.update-doc-out.mjs
node scripts/2.check-missing-values.mjs
node scripts/3.verify-docs.mjs
node scripts/4.generate-stdlib-docs-mdx.mjs
```

## How it works

The script reads the JSON file containing all the standard library functions and generates a proper MDX file with:
- Function categories (Global Utility, Array, String, etc.)
- Function signatures
- Gas costs
- Descriptions
- Examples (when available)

This approach ensures the documentation is always in sync with the JSON source while maintaining proper MDX format for Nextra.

`doc_out.json` is also read by playground.xelis.io to provide documentation for the standard library functions.
