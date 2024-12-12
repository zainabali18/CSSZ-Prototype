const fs = require('fs');
const path = require('path');

// Path to the problematic file in node_modules
const formidableFilePath = path.join(__dirname, 'node_modules', 'formidable', 'dist', 'index.cjs');

function fixFile(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes("require('node:")) {
            content = content.replace(/require\('node:(.*?)'\)/g, "require('$1')");
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`Fixed: ${filePath}`);
        } else {
            console.log(`No changes needed: ${filePath}`);
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
}

// Fix the specific file
fixFile(formidableFilePath);
