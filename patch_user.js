const fs = require('fs');
const path = require('path');
const p = path.join('C:\\Users\\HP\\backend\\src\\models\\User.js');
let c = fs.readFileSync(p, 'utf8');
c = c.replace('university: { type: mongoose.Schema.Types.ObjectId, ref: \'University\' },', 'university: { type: mongoose.Schema.Types.ObjectId, ref: \'University\' },\n      customUniversity: { type: String, default: null },');
fs.writeFileSync(p, c);
console.log('Patched User.js');
