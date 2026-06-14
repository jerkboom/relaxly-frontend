const fs = require('fs');
const p = 'C:\\Users\\HP\\backend\\src\\services\\bookingService.js';

try {
    let c = fs.readFileSync(p, 'utf8');

    const oldCreate = `  await PayoutQueue.create({
    booking: booking._id,
    owner: booking.hostel.owner,
    hostel: booking.hostel._id,
    payoutMethod: payoutMethod?._id,
    amount: booking.ownerAmount,
    commissionAmount: booking.adminCommission,
    paystackFee: 0,
    finalTransferAmount: booking.ownerAmount,
    recipientCode: payoutMethod?.recipientCode,
    currency: booking.currency || 'GHS',
    status: 'pending',
    metadata: { adminId, journalGroup }
  });`;

    const newCreate = `  await PayoutQueue.create({
    booking: booking._id,
    owner: booking.hostel.owner,
    hostel: booking.hostel._id,
    payoutMethod: payoutMethod?._id,
    transferMethod: payoutMethod?.type,
    provider: payoutMethod?.provider,
    bankName: payoutMethod?.bankName || payoutMethod?.provider,
    accountNumber: payoutMethod?.accountNumber,
    accountName: payoutMethod?.accountName,
    amount: booking.ownerAmount,
    commissionAmount: booking.adminCommission,
    paystackFee: 0,
    finalTransferAmount: booking.ownerAmount,
    recipientCode: payoutMethod?.recipientCode,
    currency: booking.currency || 'GHS',
    status: 'pending',
    metadata: { adminId, journalGroup }
  });`;

    if (c.includes(oldCreate)) {
        c = c.replace(oldCreate, newCreate);
        fs.writeFileSync(p, c);
        console.log('Successfully updated PayoutQueue creation in bookingService.js');
    } else {
        console.log('Could not find PayoutQueue.create block.');
        // Try regex
        const regex = /await\s+PayoutQueue\.create\(\{\s+booking:\s+booking\._id,[\s\S]+?\}\);/;
        if (regex.test(c)) {
            console.log('Found with regex, applying replacement...');
            c = c.replace(regex, newCreate);
            fs.writeFileSync(p, c);
            console.log('Successfully updated with regex.');
        } else {
            console.log('Regex match failed too.');
        }
    }
} catch (err) {
    console.error('Error:', err.message);
}
