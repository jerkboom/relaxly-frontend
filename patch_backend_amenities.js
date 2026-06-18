const fs = require('fs');
const file = 'C:\\Users\\HP\\backend\\src\\controllers\\hostelController.js';
let content = fs.readFileSync(file, 'utf8');

const oldAmenitiesLogic = `// Amenities filter (Requires ALL selected amenities)
    if (!isInvalid(amenities)) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : String(amenities).split(',').map(a => a.trim());
      const validAmenities = amenitiesArray.filter(a => a !== '');

      if (validAmenities.length > 0) {
        validAmenities.forEach(a => {
          const lower = a.toLowerCase();
          if (lower === 'wifi') conditions.push({ wifi: true });
          else if (lower === 'ac' || lower === 'air conditioning') conditions.push({ ac: true });
          else if (lower === 'security') conditions.push({ security: true });
          else if (lower === 'water') conditions.push({ water: true });
          else if (lower === 'electricity') conditions.push({ electricity: true });
          else if (lower === 'studyarea') conditions.push({ amenities: { $regex: /study|desk/i } });
          else if (lower === 'privatewashroom') conditions.push({ amenities: { $regex: /private washroom/i } });
          else if (lower === 'kitchen') conditions.push({ amenities: { $regex: /kitchen/i } });
          else if (lower === 'parking') conditions.push({ amenities: { $regex: /parking/i } });
          else if (lower === 'generator') conditions.push({ amenities: { $regex: /generator/i } });
          else conditions.push({ amenities: { $in: [a] } });
        });
      }
    }`;

const newAmenitiesLogic = `// Amenities filter (Requires ALL selected amenities - ID Based)
    if (!isInvalid(amenities)) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : String(amenities).split(',').map(a => a.trim());
      const validAmenities = amenitiesArray.filter(a => a !== '');

      if (validAmenities.length > 0) {
        validAmenities.forEach(a => {
          const id = a.toLowerCase();
          // Map central IDs to DB fields/logic
          if (id === 'wifi') conditions.push({ wifi: true });
          else if (id === 'ac') conditions.push({ ac: true });
          else if (id === 'security') conditions.push({ security: true });
          else if (id === 'water_supply') conditions.push({ water: true });
          else if (id === 'generator') conditions.push({ electricity: true });
          else if (id === 'private_washroom') conditions.push({ amenities: { $regex: /private washroom/i } });
          else if (id === 'shared_washroom') conditions.push({ amenities: { $regex: /shared washroom/i } });
          else if (id === 'kitchen') conditions.push({ amenities: { $regex: /[^d] kitchen/i } }); // Not shared
          else if (id === 'shared_kitchen') conditions.push({ amenities: { $regex: /shared kitchen/i } });
          else if (id === 'study_area') conditions.push({ amenities: { $regex: /study area|desk/i } });
          else if (id === 'parking') conditions.push({ amenities: { $regex: /parking/i } });
          else if (id === 'laundry') conditions.push({ amenities: { $regex: /laundry|washing/i } });
          else if (id === 'refrigerator') conditions.push({ amenities: { $regex: /refrigerator|fridge/i } });
          else if (id === 'wardrobe') conditions.push({ amenities: { $regex: /wardrobe/i } });
          else if (id === 'balcony') conditions.push({ amenities: { $regex: /balcony/i } });
          else if (id === 'television') conditions.push({ amenities: { $regex: /television|tv/i } });
          else if (id === 'ceiling_fan') conditions.push({ amenities: { $regex: /fan/i } });
          else conditions.push({ amenities: { $in: [a] } });
        });
      }
    }`;

if (content.includes(oldAmenitiesLogic)) {
    content = content.replace(oldAmenitiesLogic, newAmenitiesLogic);
    fs.writeFileSync(file, content);
    console.log('Backend Controller: Amenities filter updated to ID-based.');
} else {
    console.log('Could not find old amenities logic.');
}
