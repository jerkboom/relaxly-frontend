const fs = require('fs');
const path = require('path');
const p = path.join('C:\\Users\\HP\\backend\\src\\services\\adminUserService.js');
let c = fs.readFileSync(p, 'utf8');
c = c.replace('email: student.email,', 'email: student.email,\n        phone: student.phone || \'N/A\',\n        studentId: student.studentId || \'N/A\',');
fs.writeFileSync(p, c);
console.log('Patched adminUserService.js');
