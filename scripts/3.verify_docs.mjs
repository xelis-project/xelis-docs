#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { get_syscall_map } from './1.update_doc_out.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON file
const docOutPath = path.join(__dirname, '../resources/standard-library/doc_out.json');

function verify_std_lib(filePath) {
    console.log(`Verifying ${filePath}...`);

    let docOut;
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        docOut = JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading or parsing file: ${error}`);
        return;
    }

    let allFound = true;
    let totalFunctions = 0;
    let foundFunctions = 0;

    const args = process.argv.slice(2);
    const showMissing = args.includes('--show') || args.includes('--verbose');
    const showVerbose = args.includes('--verbose');

    for (const [categoryName, silexFunctions] of get_syscall_map()) {
        // Only print category header if we are going to print something inside it
        let printedCategoryHeader = false;
        const printCategoryHeader = () => {
            if (!printedCategoryHeader && (showMissing || showVerbose)) {
                console.log(`\nChecking Category: ${categoryName}`);
                printedCategoryHeader = true;
            }
        };

        const docCategory = docOut.find((c) => c.name === categoryName);

        if (!docCategory) {
            if (showMissing) {
                printCategoryHeader();
                console.error(`  [MISSING CATEGORY] ${categoryName}`);
            }
            allFound = false;
            // Count all functions in this category as missing
            totalFunctions += silexFunctions.length;
            continue;
        }

        for (const silexFunc of silexFunctions) {
            totalFunctions++;
            const signature = silexFunc.signature;

            // We expect exact match now since generate_docs.ts handles normalization/addition
            // But we can try normalized match if exact match fails, just to be sure what's happening
            let docFunc = docCategory.functions.find((f) => f.signature === signature);

            if (!docFunc) {
                // Try to find a match by normalizing doc signatures
                docFunc = docCategory.functions.find((f) => {
                    let normalized = f.signature.replace(/Any/g, 'any');
                    normalized = normalized.replace(/\[([a-zA-Z0-9_]+)\]/g, '$1[]');
                    normalized = normalized.replace(/u8\[\]/g, 'bytes');
                    normalized = normalized.replace(/Bytes/g, 'bytes');
                    normalized = normalized.replace(/\)⟶/g, ') ⟶');

                    if (categoryName === 'Array' || categoryName === 'Range' || categoryName === 'Optional (T or null)') {
                        normalized = normalized.replace(/\bT\b/g, 'T0');
                    } else if (categoryName === 'Map') {
                        normalized = normalized.replace(/\bK\b/g, 'T0');
                        normalized = normalized.replace(/\bV\b/g, 'T1');
                    }

                    return normalized === signature;
                });
            }

            if (docFunc) {
                if (showVerbose) {
                    printCategoryHeader();
                    console.log(`  [OK] ${signature}`);
                }
                foundFunctions++;
            } else {
                if (showMissing) {
                    printCategoryHeader();
                    console.error(`  [MISSING FUNCTION] ${signature}`);
                }
                allFound = false;
            }
        }
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`Verification Complete.`);
    console.log(`Total Functions Checked: ${totalFunctions}`);
    console.log(`Found: ${foundFunctions}`);
    console.log(`Missing: ${totalFunctions - foundFunctions}`);

    if (allFound) {
        console.log(`SUCCESS: All categories and signatures are present.`);
    } else {
        console.error(`FAILURE: Some categories or signatures are missing.`);
        if (!showMissing) {
            console.log(`Run with --show to see missing items.`);
        }
        process.exit(1);
    }
}

// Run verification
verify_std_lib(docOutPath);

// usage: ./3.verify_docs.js
// output: console log
