const fs = require('fs');
const file = 'C:\\Users\\HP\\backend\\src\\controllers\\hostelController.js';
let content = fs.readFileSync(file, 'utf8');

const robustGetHostels = `// GET ALL HOSTELS WITH SEARCH, FILTERING, SORTING & PAGINATION
const getHostels = asyncHandler(async (req, res) => {
  try {
    // CACHE CHECK: Sort keys to ensure deterministic key generation
    const sortedQuery = Object.keys(req.query)
      .sort()
      .reduce((acc, key) => {
        acc[key] = req.query[key];
        return acc;
      }, {});

    const cacheKey = \`hostels_search_\${JSON.stringify(sortedQuery)}\`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendSuccess(res, cached, 'Hostels retrieved from cache');
    }

    console.log('HOSTEL QUERY PARAMS:', req.query);

    const {
      search,
      location,
      university,
      minPrice,
      maxPrice,
      amenities,
      roomTypes,
      gender,
      verified,
      availableNow,
      roomCapacity,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    // FILTER OBJECT - Start with public-safe defaults
    let filter = {
      verificationStatus: 'approved',
      available: true,
    };

    const isInvalid = (val) => !val || val === 'undefined' || val === 'null' || val === 'all' || val === '';

    // Use an array to collect complex conditions that will be combined with $and
    const conditions = [];

    // 1. General Search Filter & University Alias Matching
    if (!isInvalid(search)) {
      const searchTerms = [search];
      const aliases = getUniversityAliases(search);
      if (aliases.length > 0) searchTerms.push(...aliases);

      const orConditions = [];
      searchTerms.forEach(term => {
        const regex = { $regex: String(term), $options: 'i' };
        orConditions.push(
          { name: regex },
          { nearestUniversity: regex },
          { nearbyUniversities: regex },
          { 'location.address': regex },
          { 'location.city': regex },
          { 'location.region': regex },
          { description: regex }
        );
      });

      conditions.push({ $or: orConditions });
    }

    // 2. Location filter (acts as specialized search)
    if (!isInvalid(location)) {
      const locationAliases = getUniversityAliases(location);
      const locTerms = [location, ...locationAliases];

      const orConditions = [];
      locTerms.forEach(term => {
        const regex = { $regex: String(term), $options: 'i' };
        orConditions.push(
          { 'location.address': regex },
          { 'location.city': regex },
          { 'location.region': regex },
          { nearestUniversity: regex },
          { nearbyUniversities: regex }
        );
      });
      conditions.push({ $or: orConditions });
    }

    // 3. University filter (explicit selection)
    if (!isInvalid(university)) {
      const normalized = normalizeUniversity(university);
      const aliases = getUniversityAliases(normalized);
      const uniTerms = [...new Set([university, normalized, ...aliases])];

      const orConditions = uniTerms.map(term => ({
        $or: [
          { nearestUniversity: { $regex: String(term), $options: 'i' } },
          { nearbyUniversities: { $regex: String(term), $options: 'i' } }
        ]
      })).flatMap(cond => cond.$or);

      if (mongoose.Types.ObjectId.isValid(university)) {
        orConditions.push({ university: university });
      }

      conditions.push({ $or: orConditions });
    }

    // Price filter
    if (!isInvalid(minPrice) || !isInvalid(maxPrice)) {
      filter.price = {};
      if (!isInvalid(minPrice)) filter.price.$gte = Number(minPrice);
      if (!isInvalid(maxPrice)) filter.price.$lte = Number(maxPrice);
    }

    // Gender filter
    if (!isInvalid(gender) && gender !== 'Mixed') {
      filter.genderAllowed = gender;
    }

    // Verified filter
    if (verified === 'true') {
      filter.isVerified = true;
    }

    // Available now
    if (availableNow === 'true') {
      filter.availableRooms = { $gt: 0 };
    }

    // Amenities filter (Requires ALL selected amenities)
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
    }

    // Room Types / Capacity filter
    const selectedRoomTypes = roomTypes || roomCapacity;
    if (!isInvalid(selectedRoomTypes)) {
      const roomTypesArray = Array.isArray(selectedRoomTypes) ? selectedRoomTypes : String(selectedRoomTypes).split(',').map(t => t.trim());
      const validTypes = roomTypesArray.filter(t => t !== '');

      if (validTypes.length > 0) {
        const mappedTypes = validTypes.map(t => {
           const low = t.toLowerCase();
           if (low === 'single') return '1-in-1';
           if (low === 'double') return '2-in-1';
           if (low === 'triple') return '3-in-1';
           if (low === 'quad') return '4-in-1';
           if (low.includes('5')) return '5-in-1';
           if (low.includes('6')) return '6-in-1';
           if (low.includes('7')) return '7-in-1';
           if (low.includes('8')) return '8-in-1';
           return t;
        });

        const hostelsWithRoomTypes = await Room.distinct('hostel', {
          occupancyStyle: { $in: mappedTypes },
          roomStatus: 'available',
          availableBeds: { $gt: 0 }
        });

        conditions.push({ _id: { $in: hostelsWithRoomTypes } });
      }
    }

    // Combine all conditions into the main filter
    if (conditions.length > 0) {
      filter.$and = conditions;
    }

    console.log('FINAL HOSTEL FILTER:', JSON.stringify(filter, null, 2));

    // Sorting
    let sortOption = { createdAt: -1 };
    if (!isInvalid(sort)) {
      switch (sort) {
        case 'price_low': sortOption = { price: 1 }; break;
        case 'price_high': sortOption = { price: -1 }; break;
        case 'popular': sortOption = { totalRooms: -1 }; break;
        case 'newest': sortOption = { createdAt: -1 }; break;
        case 'rated': sortOption = { createdAt: 1 }; break;
        default: sortOption = { createdAt: -1 };
      }
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    const hostels = await Hostel.find(filter)
      .populate('university', 'name location region')
      .populate('owner', 'name profileImage isOwnerVerified verificationStatus')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // RANKING: High-Relevance Discovery (Primary Matches First)
    if (university && !isInvalid(university)) {
      const targetUni = normalizeUniversity(university).toLowerCase();
      hostels.sort((a, b) => {
        const aPrimary = normalizeUniversity(a.nearestUniversity || '').toLowerCase() === targetUni;
        const bPrimary = normalizeUniversity(b.nearestUniversity || '').toLowerCase() === targetUni;
        const aSecondary = a.nearbyUniversities?.some(u => normalizeUniversity(u).toLowerCase() === targetUni);
        const bSecondary = b.nearbyUniversities?.some(u => normalizeUniversity(u).toLowerCase() === targetUni);
        if (aPrimary && !bPrimary) return -1;
        if (!aPrimary && bPrimary) return 1;
        if (aSecondary && !bSecondary) return -1;
        if (!aSecondary && bSecondary) return 1;
        return 0;
      });
    }

    const total = await Hostel.countDocuments(filter);

    const mappedHostels = hostels.map((h) => ({
      ...h,
      title: h.title || h.name,
      image: h.image || h.featuredImage || (h.images && h.images.length > 0 ? h.images[0] : null)
    }));

    const responseData = {
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hostels: mappedHostels,
      results: mappedHostels
    };

    cache.set(cacheKey, responseData, 300);
    sendSuccess(res, responseData, 'Hostels retrieved successfully');
  } catch (error) {
    console.error('CRITICAL ERROR IN GETHOSTELS:', error);
    return sendError(res, 'Internal Server Error during hostel search', 500);
  }
});`;

const getHostelsRegex = /\/\/ GET ALL HOSTELS WITH SEARCH, FILTERING, SORTING & PAGINATION[\s\S]+?\}\);\r?\n\}\);/;
if (getHostelsRegex.test(content)) {
    content = content.replace(getHostelsRegex, robustGetHostels);
    fs.writeFileSync(file, content);
    console.log('Hostel Controller fully overhauled with robust error handling and fixed $and logic.');
} else {
    console.log('Regex match failed. Overwriting the function manually.');
    // Manual fall back if regex fails due to line endings etc.
    const start = content.indexOf('// GET ALL HOSTELS WITH SEARCH');
    const end = content.indexOf('// GET OWNER HOSTELS');
    if (start !== -1 && end !== -1) {
        content = content.substring(0, start) + robustGetHostels + '\n\n' + content.substring(end);
        fs.writeFileSync(file, content);
        console.log('Hostel Controller overwritten successfully.');
    } else {
        console.log('Manual replacement failed.');
    }
}
