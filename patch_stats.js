const fs = require('fs');
const path = require('path');

const controllerPath = 'C:\\Users\\HP\\backend\\src\\controllers\\analyticsController.js';
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

const newFunction = `
const University = require('../models/University');
const Hostel = require('../models/Hostel');
const User = require('../models/User');
const cache = require('../utils/cache');
const { sendSuccess } = require('../utils/responseHandler');

const getPublicStats = asyncHandler(async (req, res) => {
  const cacheKey = 'public_homepage_stats';
  const cached = cache.get(cacheKey);
  if (cached) {
    return sendSuccess(res, cached, 'Public stats retrieved from cache');
  }

  const [universitiesCount, hostelsCount, studentsCount] = await Promise.all([
    University.countDocuments(),
    Hostel.countDocuments({ verificationStatus: 'approved' }),
    User.countDocuments({ role: 'student', accountStatus: 'active' })
  ]);

  const stats = {
    universities: universitiesCount,
    hostels: hostelsCount,
    students: studentsCount
  };

  cache.set(cacheKey, stats, 900); // 15 minutes

  sendSuccess(res, stats);
});

module.exports = {
  getPublicStats,`;

controllerContent = controllerContent.replace('module.exports = {', newFunction);
fs.writeFileSync(controllerPath, controllerContent);

const routesPath = 'C:\\Users\\HP\\backend\\src\\routes\\analyticsRoutes.js';
let routesContent = fs.readFileSync(routesPath, 'utf8');

const newRouteImport = `  trackEvent,
  getPublicStats,
} = require('../controllers/analyticsController');`;

routesContent = routesContent.replace(`  trackEvent,\r\n} = require('../controllers/analyticsController');`, newRouteImport);
routesContent = routesContent.replace(`  trackEvent,\n} = require('../controllers/analyticsController');`, newRouteImport);

const newRoute = `// Public tracking route
router.post('/track', trackEvent);

// Public stats route
router.get('/public-stats', getPublicStats);`;

routesContent = routesContent.replace(`// Public tracking route\r\nrouter.post('/track', trackEvent);`, newRoute);
routesContent = routesContent.replace(`// Public tracking route\nrouter.post('/track', trackEvent);`, newRoute);

fs.writeFileSync(routesPath, routesContent);

console.log('Backend stats logic patched successfully.');
