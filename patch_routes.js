const fs = require('fs');
const path = require('path');
const p = path.join('C:\\Users\\HP\\backend\\src\\routes\\adminRoutes.js');
let c = fs.readFileSync(p, 'utf8');

c = c.replace('getCacheStats,\r\n}', 'getCacheStats,\r\n  getCustomUniversities,\r\n}');
c = c.replace('getCacheStats,\n}', 'getCacheStats,\n  getCustomUniversities,\n}');

fs.writeFileSync(p, c);
console.log('Patched adminRoutes.js to import getCustomUniversities');
