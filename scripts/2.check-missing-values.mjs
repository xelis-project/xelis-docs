#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON file
const docOutPath = path.join(__dirname, '../resources/standard-library/doc_out.json');

function show_missing_syscalls_and_gas(filePath) {
    console.log(`Checking for missing values in ${filePath}...`);

    let docOut;
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        docOut = JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading or parsing file: ${error}`);
        return;
    }

    let missingCount = 0;

    for (const category of docOut) {
        for (const func of category.functions) {
            if (func.syscall_id === -1 || func.gas_cost === -1) {
                console.log(`Category: ${category.name} - Signature: ${func.signature}`);
                if (func.syscall_id === -1) console.log(`  - Missing syscall_id`);
                if (func.gas_cost === -1) console.log(`  - Missing gas_cost`);
                missingCount++;
            }
        }
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`Check Complete.`);
    console.log(`Total Functions with Missing Values: ${missingCount}`);
}

// Run check
show_missing_syscalls_and_gas(docOutPath);

// usage: ./2.check_missing_values.js
// output: console log
