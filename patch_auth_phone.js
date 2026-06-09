const fs = require('fs');
const path = require('path');
const p = path.join('C:\\Users\\HP\\backend\\src\\controllers\\authController.js');
let c = fs.readFileSync(p, 'utf8');

const oldDestructure = `    const {
      name,
      email,
      password,
      gender,
      role = 'student',
      accessCode, // Used for owners only
      governmentIdUrl, university, studentId } = req.body;`;

const newDestructure = `    const {
      name,
      email,
      password,
      gender,
      phone,
      role = 'student',
      accessCode,
      governmentIdUrl, 
      university, 
      studentId 
    } = req.body;`;

c = c.replace(oldDestructure, newDestructure);

const oldValidation = `    // 1. HARD VALIDATION: Required Fields for everyone
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide all required fields (name, email, password).');
    }`;

const newValidation = `    // 1. HARD VALIDATION: Required Fields for everyone
    if (!name || !email || !password || !phone) {
      res.status(400);
      throw new Error('Please provide all required fields (name, email, password, phone).');
    }
    
    // Validate phone number format (Ghana numbers)
    const phoneRegex = /^(?:\\+233|0)[2-5]\\d{8}$/;
    if (!phoneRegex.test(phone)) {
      res.status(400);
      throw new Error('Please provide a valid phone number (e.g., 0241234567 or +233241234567).');
    }`;

c = c.replace(oldValidation, newValidation);

c = c.replace('password,\r\n      gender,', 'password,\r\n      gender,\r\n      phone,');
c = c.replace('password,\n      gender,', 'password,\n      gender,\n      phone,');

fs.writeFileSync(p, c);
console.log('Patched authController.js with phone number.');
