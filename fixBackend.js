const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\HP\\backend\\src\\controllers\\bookingController.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the false 'New booking' notification
const notifRegex = /if\s*\(\s*hostelForOwner\?\.owner\s*\)\s*\{\s*await\s*createNotification\(\{\s*user:\s*hostelForOwner\.owner,\s*title:\s*'New booking'[\s\S]*?\}\);\s*\}/g;
content = content.replace(notifRegex, '');

// 2. Update the query in getOwnerBookings
const queryRegex = /(const\s+bookings\s*=\s*await\s+Booking\.find\(\{\s*hostel:\s*\{\s*\$in:\s*hostelIds,?\s*\},?)(\s*\})/;
content = content.replace(queryRegex, '$1 paymentStatus: { $ne: "pending" },$2');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed bookingController.js');
