#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON file
const docOutPath = path.join(__dirname, '../resources/standard-library/doc_out.json');
const docOutDir = path.join(__dirname, '../resources/standard-library/');
const stdLibDataPath = path.join(__dirname, '../resources/standard-library/std_lib_data.json');

// This is the format of the doc_out.json file
// Descriptions and examples in doc_out.json are MANUALLY added/vetted, or in the future,
// this document gets generated from data in a database.

/**
 * NOTE: Recommendation: On first run, use the console messages to fix signatures. Then rerun.
 * TODO: Use tools to fix signatures automatically.
 */

export function get_doc_template() {

    // read the doc_out.json file, where updated documentation is stored
    const doc_out = fs.readFileSync(docOutPath, "utf-8");
    const doc_out_json = JSON.parse(doc_out);

    // set syscall_id to -1 and gas_cost to -1.
    const template = doc_out_json.map((format) => {
        return {
            ...format,
            functions: format.functions.map((func) => {
                return {
                    ...func,
                    syscall_id: -1,
                    gas_cost: -1
                };
            })
        };
    });

    return template;
}

// This is the format we need from func list to generate the docs.
// generated in playground by cat_type_by_doc_order() in func_list.ts
// This data should be recent. Always get the latest playground data.
// For now, we copy the data from the console, and save the data in std_lib_data.json.
// todo: 1. get the data dynamically.
// todo: 2. get data directly from rust code.

export function get_syscall_map() {
    const syscall_data = JSON.parse(fs.readFileSync(stdLibDataPath, 'utf-8'));
    return new Map(syscall_data);
}

export function generate_doc_as_json() {

    const doc_out = JSON.parse(JSON.stringify(get_doc_template()));
    const syscall_map = get_syscall_map();
    const matchedSyscallIds = new Set();

    for (const category of doc_out) {
        const categoryName = category.name;
        const silexCategory = syscall_map.get(categoryName);

        if (!silexCategory) {
            console.warn(`Category not found in silex std library data: ${categoryName}`);
            continue;
        }

        for (const func of category.functions) {
            let signature = func.signature;

            // Find matching function in silexCategory
            let silexFunc = silexCategory.find(f => f.signature === func.signature);

            if (!silexFunc) {
                silexFunc = silexCategory.find(f => f.signature === signature);
            }

            if (silexFunc) {
                func.syscall_id = silexFunc.syscall_id;
                func.gas_cost = silexFunc.gas_cost;
                matchedSyscallIds.add(silexFunc.syscall_id);
            } else {
                console.warn(`Function not found in silex library data for this category ${categoryName}: ${func.signature} ${signature}`);
            }
        }
    }

    // Add missing functions
    for (const [categoryName, functions] of syscall_map) {
        for (const silexFunc of functions) {
            if (!matchedSyscallIds.has(silexFunc.syscall_id)) {
                let docCategory = doc_out.find((c) => c.name === categoryName);
                if (!docCategory) {
                    console.log(`Adding new category: ${categoryName}`);
                    docCategory = {
                        name: categoryName,
                        functions: [],
                        category_notes: undefined
                    };
                    doc_out.push(docCategory);
                }

                console.log(`Adding missing function to ${categoryName}: ${silexFunc.signature}`);
                docCategory.functions.push({
                    syscall_id: silexFunc.syscall_id,
                    signature: silexFunc.signature,
                    description: "[Documentation Required]",
                    example: "",
                    gas_cost: silexFunc.gas_cost
                });
            }
        }
    }

    return doc_out;
}

export function save_doc_json() {
    const jsonOutput = generate_doc_as_json();
    // Target the file in the subdirectory

    if (fs.existsSync(docOutPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${docOutDir}/doc_out_${timestamp}.json`;
        fs.copyFileSync(docOutPath, backupPath);
        console.log(`Backup created at ${backupPath}`);
    }

    fs.writeFileSync(docOutPath, JSON.stringify(jsonOutput, null, 4));
    console.log(`Documentation saved to ${docOutPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    save_doc_json();
}

// usage: ./1.generate_docs.js
// output: doc_out.json - older version will be backed up.
