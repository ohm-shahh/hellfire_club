// ============================================
// MOCK DATA - Structured like API responses
// ============================================

// Command Center / Overview Data
export const OVERVIEW_STATS = {
  traffic: {
    level: "Moderate",
    percentage: 65,
    color: "yellow"
  },
  dengueRisk: {
    level: "HIGH",
    color: "red"
  },
  foodPrice: {
    status: "Stable",
    change: "+1.2%",
    color: "green"
  },
  weather: {
    alert: "Heavy Rain Warning",
    color: "orange"
  }
};

export const CRITICAL_ALERTS = [
  {
    id: 1,
    type: "warning",
    title: "High Dengue Risk in Sector 4",
    subtitle: "(Rain + Humidity)",
    icon: "alert"
  },
  {
    id: 2,
    type: "warning",
    title: "Traffic Choke on SG Highway",
    subtitle: "",
    icon: "traffic"
  }
];

export const SYSTEM_HEALTH = {
  dataPipeline: {
    status: "Active",
    color: "Green"
  }
};

// ============================================
// Traffic / Urban Mobility Data
// ============================================

export const CONGESTION_TIMELINE = [
  { hour: 0, congestion: 15 },
  { hour: 1, congestion: 12 },
  { hour: 2, congestion: 18 },
  { hour: 3, congestion: 20 },
  { hour: 4, congestion: 25 },
  { hour: 5, congestion: 35 },
  { hour: 6, congestion: 68 },
  { hour: 7, congestion: 102 },
  { hour: 8, congestion: 118 },
  { hour: 9, congestion: 101 },
  { hour: 10, congestion: 68 },
  { hour: 11, congestion: 50 },
  { hour: 12, congestion: 48 },
  { hour: 13, congestion: 45 },
  { hour: 14, congestion: 38 },
  { hour: 15, congestion: 46 },
  { hour: 16, congestion: 62 },
  { hour: 17, congestion: 95 },
  { hour: 18, congestion: 112 },
  { hour: 19, congestion: 93 },
  { hour: 20, congestion: 70 },
  { hour: 21, congestion: 50 },
  { hour: 22, congestion: 38 },
  { hour: 23, congestion: 30 },
  { hour: 24, congestion: 18 }
];

export const ROUTE_STATUS = [
  {
    id: 1,
    name: "SG Highway",
    status: "Choked",
    avgSpeed: 15,
    color: "red"
  },
  {
    id: 2,
    name: "Ring Road",
    status: "Moderate",
    avgSpeed: 40,
    color: "yellow"
  },
  {
    id: 3,
    name: "Airport Road",
    status: "Clear",
    avgSpeed: 60,
    color: "green"
  }
];

export const TRAFFIC_ANOMALY = {
  detected: true,
  location: "Gandhi Bridge",
  time: "2:30 AM",
  type: "High congestion",
  reason: "Potential Accident or Event"
};

export const PUBLIC_TRANSPORT_STATUS = {
  metro: "Normal",
  bus: "Delays on Route 12"
};

// ============================================
// Public Health Data
// ============================================

export const WEATHER_DISEASE_CORRELATION = [
  { day: 0, rainfall: 10, cases: 20 },
  { day: 1, rainfall: 15, cases: 25 },
  { day: 2, rainfall: 30, cases: 35 },
  { day: 3, rainfall: 25, cases: 50 },
  { day: 4, rainfall: 80, cases: 120 },
  { day: 5, rainfall: 100, cases: 180 },
  { day: 6, rainfall: 75, cases: 220 },
  { day: 7, rainfall: 50, cases: 260 },
  { day: 8, rainfall: 45, cases: 290 },
  { day: 9, rainfall: 35, cases: 340 },
  { day: 10, rainfall: 30, cases: 400 },
  { day: 11, rainfall: 28, cases: 460 },
  { day: 12, rainfall: 25, cases: 500 },
  { day: 13, rainfall: 22, cases: 520 },
  { day: 14, rainfall: 20, cases: 510 },
  { day: 15, rainfall: 18, cases: 480 }
];

export const ENVIRONMENTAL_RISK = {
  humidity: 85,
  humidityLevel: "High",
  temperature: 28,
  standingWaterIndex: "High"
};

export const HOSPITAL_LOAD = [
  {
    id: 1,
    name: "City Hospital A",
    availableBeds: 150,
    totalBeds: 500,
    predictedSurge: "+120 Cases",
    riskLevel: "High Risk"
  },
  {
    id: 2,
    name: "City Hospital B",
    availableBeds: 100,
    totalBeds: 500,
    predictedSurge: "+120 Cases",
    riskLevel: "High Risk"
  }
];

// ============================================
// Simulation Lab Data
// ============================================

export const SIMULATION_DEFAULTS = {
  rainfallIncrease: 20,
  mosquitoControlBudget: -10,
  highwayClosed: false
};

export const generateSimulationResult = (rainfall, mosquitoBudget, highwayClosed) => {
  // Simple prediction model
  const baselineCases = 350;
  const rainfallImpact = (rainfall / 100) * 200;
  const mosquitoImpact = (mosquitoBudget / 100) * -50;
  
  const predictedCases = baselineCases + rainfallImpact + mosquitoImpact;
  const dengueCaseIncrease = Math.round(((predictedCases - baselineCases) / baselineCases) * 100);
  
  const foodPriceChange = highwayClosed ? "+1.10%" : "+2%";
  const hospitalLoadChange = highwayClosed ? "+1.55%" : "+5%";
  
  return {
    description: `Increasing rainfall by ${rainfall}% and reducing mosquito control by ${Math.abs(mosquitoBudget)}% is predicted to increase Dengue cases by ${dengueCaseIncrease}% within 4 days.`,
    dengueCaseIncrease,
    timeline: Array.from({ length: 11 }, (_, i) => ({
      day: i,
      baseline: 50 + (i * 30),
      simulated: 50 + (i * 30) + (rainfallImpact / 10) * i
    })),
    metrics: {
      foodPrices: {
        prevention: "+2% (+2%)",
        scenario: `${foodPriceChange} (-10%)`
      },
      hospitalLoad: {
        prevention: "+5% (+5%)",
        scenario: `${hospitalLoadChange} (-20%)`
      }
    }
  };
};

// ============================================
// Agriculture & Supply Chain Data
// ============================================

export const SUPPLY_CHAIN_STAGES = [
  { id: 1, name: "Rural Farms", subtitle: "(Crop: Wheat)", icon: "farm" },
  { id: 2, name: "Transport", subtitle: "(Trucks, Train)", icon: "truck" },
  { id: 3, name: "City Wholesale Market", subtitle: "", icon: "warehouse" },
  { id: 4, name: "Local Retailers & Consumers", subtitle: "", icon: "users" }
];

export const PRICE_VOLATILITY = [
  { day: 0, price: 3.2 },
  { day: 2, price: 3.3 },
  { day: 4, price: 3.5 },
  { day: 6, price: 3.4 },
  { day: 8, price: 3.6 },
  { day: 10, price: 3.5 },
  { day: 11, price: 3.4 },
  { day: 14, price: 3.5 },
  { day: 15, price: 3.6 },
  { day: 16, price: 3.7 },
  { day: 18, price: 3.9 },
  { day: 19, price: 4.0 },
  { day: 20, price: 4.2 },
  { day: 22, price: 4.5 },
  { day: 24, price: 5.2 },
  { day: 26, price: 7.8 },
  { day: 28, price: 9.5 },
  { day: 30, price: 10.2 }
];

export const PRICE_SPIKE = {
  value: "+1.2%",
  reason: "due to transport strike"
};

export const SPOILAGE_RISK = {
  product: "Vegetables",
  reason: "Temperature High (35°C) + Transport Delay (4 hours)",
  riskLevel: "High"
};

export const MARKET_INVENTORY = {
  wheat: {
    status: "Adequate",
    color: "green"
  },
  vegetables: {
    status: "Low",
    color: "red"
  },
  fruits: {
    status: "Moderate",
    color: "yellow"
  }
};