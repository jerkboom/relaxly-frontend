const fs = require('fs');
const path = require('path');
const p = path.join('C:\\Users\\HP\\backend\\src\\routes\\adminRoutes.js');
let c = fs.readFileSync(p, 'utf8');

c = c.replace('getAllRegistrationAccessCodes,\r\n  getAllHostelsForAdmin', 'getAllRegistrationAccessCodes,\r\n  getCustomUniversities,\r\n  getAllHostelsForAdmin');
c = c.replace('getAllRegistrationAccessCodes,\n  getAllHostelsForAdmin', 'getAllRegistrationAccessCodes,\n  getCustomUniversities,\n  getAllHostelsForAdmin');

c = c.replace('// HOSTEL MODERATION', '// CUSTOM UNIVERSITIES REPORT\r\nrouter.get(\'/universities/custom\', authorizeAdminRoles(\'super_admin\', \'moderator\'), getCustomUniversities);\r\n\r\n// HOSTEL MODERATION');

fs.writeFileSync(p, c);
console.log('Patched adminRoutes.js with getCustomUniversities');
