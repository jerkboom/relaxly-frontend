const fs = require('fs');
const path = require('path');
const p = path.join('C:\\Users\\HP\\backend\\src\\controllers\\authController.js');
let c = fs.readFileSync(p, 'utf8');

const oldCode = `    let userPayload = {
      name,
      email: email.toLowerCase(),
      password,
      gender,
      role: role === 'owner' ? 'owner' : 'student', }; if (role !== 'owner') { if (!university || !studentId) { res.status(400); throw new Error('Students must provide their University and Student ID Number.'); } userPayload.university = university; userPayload.studentId = studentId; } let inviteRecord = null;`;

const newCode = `    let userPayload = {
      name,
      email: email.toLowerCase(),
      password,
      gender,
      role: role === 'owner' ? 'owner' : 'student',
    }; 
    if (role !== 'owner') { 
      if (!university || !studentId) { 
        res.status(400); 
        throw new Error('Students must provide their University and Student ID Number.'); 
      } 
      if (university === 'other') {
        if (!req.body.customUniversity) {
          res.status(400); 
          throw new Error('Please enter your university name.');
        }
        userPayload.university = null;
        userPayload.customUniversity = req.body.customUniversity;
      } else {
        userPayload.university = university; 
        userPayload.customUniversity = null;
      }
      userPayload.studentId = studentId; 
    } 
    let inviteRecord = null;`;

c = c.replace(oldCode, newCode);

fs.writeFileSync(p, c);
console.log('Patched authController.js');
