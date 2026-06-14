const fs = require('fs');
const p = 'C:\\Users\\HP\\backend\\src\\models\\PayoutQueue.js';

try {
    let c = fs.readFileSync(p, 'utf8');

    // Add new fields to the schema
    const oldField = "payoutMethod: {";
    const newFields = `transferMethod: {
      type: String,
      enum: ['momo', 'bank'],
    },
    provider: String, // e.g. 'MTN', 'Vodafone'
    bankName: String,
    accountNumber: String,
    accountName: String,
    payoutMethod: {`;

    if (c.includes(oldField) && !c.includes('transferMethod')) {
        c = c.replace(oldField, newFields);
        fs.writeFileSync(p, c);
        console.log('Successfully added destination fields to PayoutQueue model.');
    } else {
        console.log('Fields already exist or anchor not found.');
    }
} catch (err) {
    console.error('Error:', err.message);
}
