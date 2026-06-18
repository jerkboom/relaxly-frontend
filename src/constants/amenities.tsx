import React from 'react';
import { 
  FaWifi, 
  FaSnowflake, 
  FaBath, 
  FaToilet, 
  FaUtensils, 
  FaShieldAlt, 
  FaBookOpen, 
  FaBolt, 
  FaCar, 
  FaTint, 
  FaTshirt, 
  FaFan, 
  FaTv,
  FaDoorOpen,
  FaSun,
  FaEye,
  FaBroom,
  FaPlug
} from 'react-icons/fa';

export interface AmenityConfig {
  id: string;
  label: string;
  category: 'essential' | 'comfort' | 'safety' | 'academic' | 'utilities' | 'bathroom' | 'kitchen' | 'laundry';
  icon: React.ReactNode;
  appliesTo: 'hostel' | 'room' | 'both';
}

export const AMENITIES: AmenityConfig[] = [
  // --- HOSTEL LEVEL AMENITIES ---
  {
    id: "wifi",
    label: "WiFi",
    category: "essential",
    icon: <FaWifi />,
    appliesTo: 'hostel'
  },
  {
    id: "security",
    label: "Security Service",
    category: "safety",
    icon: <FaShieldAlt />,
    appliesTo: 'hostel'
  },
  {
    id: "cctv",
    label: "CCTV Monitoring",
    category: "safety",
    icon: <FaEye />,
    appliesTo: 'hostel'
  },
  {
    id: "generator",
    label: "Generator Backup",
    category: "utilities",
    icon: <FaBolt />,
    appliesTo: 'hostel'
  },
  {
    id: "parking",
    label: "Parking",
    category: "utilities",
    icon: <FaCar />,
    appliesTo: 'hostel'
  },
  {
    id: "water_supply",
    label: "24/7 Water Supply",
    category: "utilities",
    icon: <FaTint />,
    appliesTo: 'hostel'
  },
  {
    id: "laundry",
    label: "Laundry Service",
    category: "laundry",
    icon: <FaTshirt />,
    appliesTo: 'hostel'
  },
  {
    id: "study_area",
    label: "General Study Area",
    category: "academic",
    icon: <FaBookOpen />,
    appliesTo: 'hostel'
  },
  {
    id: "cleaning",
    label: "Cleaning Service",
    category: "essential",
    icon: <FaBroom />,
    appliesTo: 'hostel'
  },

  // --- ROOM LEVEL AMENITIES ---
  {
    id: "ac",
    label: "Air Conditioning",
    category: "comfort",
    icon: <FaSnowflake />,
    appliesTo: 'room'
  },
  {
    id: "private_washroom",
    label: "Private Washroom",
    category: "bathroom",
    icon: <FaBath />,
    appliesTo: 'room'
  },
  {
    id: "shared_washroom",
    label: "Shared Washroom",
    category: "bathroom",
    icon: <FaToilet />,
    appliesTo: 'room'
  },
  {
    id: "kitchen",
    label: "In-Room Kitchen",
    category: "kitchen",
    icon: <FaUtensils />,
    appliesTo: 'room'
  },
  {
    id: "shared_kitchen",
    label: "Shared Kitchen",
    category: "kitchen",
    icon: <FaUtensils />,
    appliesTo: 'room'
  },
  {
    id: "refrigerator",
    label: "Refrigerator",
    category: "kitchen",
    icon: <FaSnowflake />,
    appliesTo: 'room'
  },
  {
    id: "microwave",
    label: "Microwave",
    category: "kitchen",
    icon: <FaUtensils />,
    appliesTo: 'room'
  },
  {
    id: "wardrobe",
    label: "Wardrobe",
    category: "essential",
    icon: <FaDoorOpen />,
    appliesTo: 'room'
  },
  {
    id: "study_desk",
    label: "Personal Study Desk",
    category: "academic",
    icon: <FaBookOpen />,
    appliesTo: 'room'
  },
  {
    id: "balcony",
    label: "Balcony",
    category: "comfort",
    icon: <FaSun />,
    appliesTo: 'room'
  },
  {
    id: "television",
    label: "Television",
    category: "comfort",
    icon: <FaTv />,
    appliesTo: 'room'
  },
  {
    id: "ceiling_fan",
    label: "Ceiling Fan",
    category: "comfort",
    icon: <FaFan />,
    appliesTo: 'room'
  },
  {
    id: "water_heater",
    label: "Water Heater",
    category: "utilities",
    icon: <FaTint />,
    appliesTo: 'room'
  }
];

export const HOSTEL_AMENITIES = AMENITIES.filter(a => a.appliesTo === 'hostel' || a.appliesTo === 'both');
export const ROOM_AMENITIES = AMENITIES.filter(a => a.appliesTo === 'room' || a.appliesTo === 'both');

/**
 * Helper to get amenity by ID
 */
export const getAmenityById = (id: string) => AMENITIES.find(a => a.id === id);

/**
 * Helper to get label by ID
 */
export const getAmenityLabel = (id: string) => getAmenityById(id)?.label || id;
