const fs = require('fs');
const path = require('path');
const p = path.join('C:\\Users\\HP\\backend\\src\\models\\User.js');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/phone:\s*\{\s*type:\s*String,?\s*\}/, 'phone: {\n        type: String,\n        trim: true,\n      }');
fs.writeFileSync(p, c);
console.log('Patched User.js phone field.');
