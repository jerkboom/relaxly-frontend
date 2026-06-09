const fs = require('fs');
const path = require('path');
const p = path.join('C:\\Users\\HP\\backend\\src\\controllers\\adminController.js');
let c = fs.readFileSync(p, 'utf8');

const reportEndpoint = `// --- CUSTOM UNIVERSITIES REPORT ---
const getCustomUniversities = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const users = await User.find({ role: 'student', customUniversity: { $ne: null } })
    .select('name email customUniversity createdAt')
    .sort({ createdAt: -1 });

  const report = users.map(u => ({
    student: u.name,
    email: u.email,
    universityEntered: u.customUniversity,
    submittedAt: u.createdAt
  }));

  sendSuccess(res, report, 'Custom universities report retrieved');
});

// --- HOSTEL MODERATION ---`;

c = c.replace('// --- HOSTEL MODERATION ---', reportEndpoint);
c = c.replace('getCacheStats\r\n};', 'getCacheStats,\r\n  getCustomUniversities\r\n};');
c = c.replace('getCacheStats\n};', 'getCacheStats,\n  getCustomUniversities\n};');

fs.writeFileSync(p, c);
console.log('Patched adminController.js with getCustomUniversities');
