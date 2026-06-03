// client/src/utils/medicinesData.js

// Complete medicine database with brand-specific medicines and unique prices
export const medicinesDatabase = [
  // Cipla Medicines
  { id: 1, name: "Paracetamol 500mg Tablet", brand: "Cipla", basePrice: 45, category: "Pain Relief", strength: "500mg", form: "Tablet" },
  { id: 2, name: "Ibuprofen 400mg Tablet", brand: "Cipla", basePrice: 40, category: "Pain Relief", strength: "400mg", form: "Tablet" },
  { id: 3, name: "Azithromycin 500mg Tablet", brand: "Cipla", basePrice: 85, category: "Antibiotic", strength: "500mg", form: "Tablet" },
  { id: 4, name: "Amoxicillin 250mg Capsule", brand: "Cipla", basePrice: 55, category: "Antibiotic", strength: "250mg", form: "Capsule" },
  { id: 5, name: "Omeprazole 20mg Capsule", brand: "Cipla", basePrice: 35, category: "Gastric", strength: "20mg", form: "Capsule" },
  { id: 6, name: "Cetirizine 10mg Tablet", brand: "Cipla", basePrice: 25, category: "Antihistamine", strength: "10mg", form: "Tablet" },
  { id: 7, name: "Ciprofloxacin 500mg Tablet", brand: "Cipla", basePrice: 60, category: "Antibiotic", strength: "500mg", form: "Tablet" },
  { id: 8, name: "Doxycycline 100mg Capsule", brand: "Cipla", basePrice: 65, category: "Antibiotic", strength: "100mg", form: "Capsule" },
  { id: 9, name: "Metformin 500mg Tablet", brand: "Cipla", basePrice: 30, category: "Diabetes", strength: "500mg", form: "Tablet" },
  { id: 10, name: "Atorvastatin 10mg Tablet", brand: "Cipla", basePrice: 70, category: "Cholesterol", strength: "10mg", form: "Tablet" },
  { id: 11, name: "Losartan 50mg Tablet", brand: "Cipla", basePrice: 55, category: "Blood Pressure", strength: "50mg", form: "Tablet" },
  { id: 12, name: "Amlodipine 5mg Tablet", brand: "Cipla", basePrice: 48, category: "Blood Pressure", strength: "5mg", form: "Tablet" },
  { id: 13, name: "Pantoprazole 40mg Tablet", brand: "Cipla", basePrice: 45, category: "Gastric", strength: "40mg", form: "Tablet" },
  { id: 14, name: "Montelukast 10mg Tablet", brand: "Cipla", basePrice: 72, category: "Asthma", strength: "10mg", form: "Tablet" },
  { id: 15, name: "Cough Syrup DM 100ml", brand: "Cipla", basePrice: 95, category: "Cough", strength: "100ml", form: "Syrup" },

  // Sun Pharma Medicines
  { id: 16, name: "Paracetamol 500mg Tablet", brand: "Sun Pharma", basePrice: 42, category: "Pain Relief", strength: "500mg", form: "Tablet" },
  { id: 17, name: "Ibuprofen 400mg Tablet", brand: "Sun Pharma", basePrice: 38, category: "Pain Relief", strength: "400mg", form: "Tablet" },
  { id: 18, name: "Metformin 500mg Tablet", brand: "Sun Pharma", basePrice: 28, category: "Diabetes", strength: "500mg", form: "Tablet" },
  { id: 19, name: "Losartan 50mg Tablet", brand: "Sun Pharma", basePrice: 52, category: "Blood Pressure", strength: "50mg", form: "Tablet" },
  { id: 20, name: "Diclofenac 50mg Tablet", brand: "Sun Pharma", basePrice: 35, category: "Pain Relief", strength: "50mg", form: "Tablet" },
  { id: 21, name: "Vitamin D3 60000IU Capsule", brand: "Sun Pharma", basePrice: 120, category: "Supplements", strength: "60000IU", form: "Capsule" },
  { id: 22, name: "Telmisartan 40mg Tablet", brand: "Sun Pharma", basePrice: 58, category: "Blood Pressure", strength: "40mg", form: "Tablet" },
  { id: 23, name: "Rosuvastatin 10mg Tablet", brand: "Sun Pharma", basePrice: 72, category: "Cholesterol", strength: "10mg", form: "Tablet" },
  { id: 24, name: "Amlodipine 5mg Tablet", brand: "Sun Pharma", basePrice: 45, category: "Blood Pressure", strength: "5mg", form: "Tablet" },
  { id: 25, name: "Cetirizine 10mg Tablet", brand: "Sun Pharma", basePrice: 22, category: "Antihistamine", strength: "10mg", form: "Tablet" },
  { id: 26, name: "Azithromycin 500mg Tablet", brand: "Sun Pharma", basePrice: 80, category: "Antibiotic", strength: "500mg", form: "Tablet" },
  { id: 27, name: "Omeprazole 20mg Capsule", brand: "Sun Pharma", basePrice: 32, category: "Gastric", strength: "20mg", form: "Capsule" },

  // Dr. Reddy's Medicines
  { id: 28, name: "Atorvastatin 10mg Tablet", brand: "Dr. Reddy's", basePrice: 65, category: "Cholesterol", strength: "10mg", form: "Tablet" },
  { id: 29, name: "Pantoprazole 40mg Tablet", brand: "Dr. Reddy's", basePrice: 42, category: "Gastric", strength: "40mg", form: "Tablet" },
  { id: 30, name: "Montelukast 10mg Tablet", brand: "Dr. Reddy's", basePrice: 68, category: "Asthma", strength: "10mg", form: "Tablet" },
  { id: 31, name: "Gabapentin 300mg Capsule", brand: "Dr. Reddy's", basePrice: 90, category: "Nerve Pain", strength: "300mg", form: "Capsule" },
  { id: 32, name: "Ondansetron 4mg Tablet", brand: "Dr. Reddy's", basePrice: 55, category: "Anti-emetic", strength: "4mg", form: "Tablet" },
  { id: 33, name: "Escitalopram 10mg Tablet", brand: "Dr. Reddy's", basePrice: 68, category: "Antidepressant", strength: "10mg", form: "Tablet" },
  { id: 34, name: "Pregabalin 75mg Capsule", brand: "Dr. Reddy's", basePrice: 85, category: "Nerve Pain", strength: "75mg", form: "Capsule" },
  { id: 35, name: "Metformin 500mg Tablet", brand: "Dr. Reddy's", basePrice: 32, category: "Diabetes", strength: "500mg", form: "Tablet" },
  { id: 36, name: "Paracetamol 500mg Tablet", brand: "Dr. Reddy's", basePrice: 44, category: "Pain Relief", strength: "500mg", form: "Tablet" },
  { id: 37, name: "Amoxicillin 250mg Capsule", brand: "Dr. Reddy's", basePrice: 52, category: "Antibiotic", strength: "250mg", form: "Capsule" },

  // Abbott Medicines
  { id: 38, name: "Amlodipine 5mg Tablet", brand: "Abbott", basePrice: 50, category: "Blood Pressure", strength: "5mg", form: "Tablet" },
  { id: 39, name: "Clopidogrel 75mg Tablet", brand: "Abbott", basePrice: 75, category: "Blood Thinner", strength: "75mg", form: "Tablet" },
  { id: 40, name: "Levofloxacin 500mg Tablet", brand: "Abbott", basePrice: 80, category: "Antibiotic", strength: "500mg", form: "Tablet" },
  { id: 41, name: "Prednisolone 5mg Tablet", brand: "Abbott", basePrice: 42, category: "Steroid", strength: "5mg", form: "Tablet" },
  { id: 42, name: "Salbutamol 100mcg Inhaler", brand: "Abbott", basePrice: 150, category: "Asthma", strength: "100mcg", form: "Inhaler" },
  { id: 43, name: "Metoprolol 25mg Tablet", brand: "Abbott", basePrice: 44, category: "Blood Pressure", strength: "25mg", form: "Tablet" },
  { id: 44, name: "Furosemide 40mg Tablet", brand: "Abbott", basePrice: 35, category: "Diuretic", strength: "40mg", form: "Tablet" },
  { id: 45, name: "Azithromycin 500mg Tablet", brand: "Abbott", basePrice: 88, category: "Antibiotic", strength: "500mg", form: "Tablet" },
  { id: 46, name: "Omeprazole 20mg Capsule", brand: "Abbott", basePrice: 38, category: "Gastric", strength: "20mg", form: "Capsule" },
  { id: 47, name: "Ibuprofen 400mg Tablet", brand: "Abbott", basePrice: 42, category: "Pain Relief", strength: "400mg", form: "Tablet" },

  // Mankind Pharma Medicines
  { id: 48, name: "Doxycycline 100mg Capsule", brand: "Mankind Pharma", basePrice: 60, category: "Antibiotic", strength: "100mg", form: "Capsule" },
  { id: 49, name: "Ciprofloxacin 500mg Tablet", brand: "Mankind Pharma", basePrice: 55, category: "Antibiotic", strength: "500mg", form: "Tablet" },
  { id: 50, name: "Fluconazole 150mg Tablet", brand: "Mankind Pharma", basePrice: 45, category: "Antifungal", strength: "150mg", form: "Tablet" },
  { id: 51, name: "Tramadol 50mg Capsule", brand: "Mankind Pharma", basePrice: 65, category: "Pain Relief", strength: "50mg", form: "Capsule" },
  { id: 52, name: "Mefenamic Acid 250mg Tablet", brand: "Mankind Pharma", basePrice: 38, category: "Pain Relief", strength: "250mg", form: "Tablet" },
  { id: 53, name: "Loratadine 10mg Tablet", brand: "Mankind Pharma", basePrice: 28, category: "Antihistamine", strength: "10mg", form: "Tablet" },
  { id: 54, name: "Domperidone 10mg Tablet", brand: "Mankind Pharma", basePrice: 32, category: "Gastric", strength: "10mg", form: "Tablet" },
  { id: 55, name: "Paracetamol 500mg Tablet", brand: "Mankind Pharma", basePrice: 40, category: "Pain Relief", strength: "500mg", form: "Tablet" },
  { id: 56, name: "Metformin 500mg Tablet", brand: "Mankind Pharma", basePrice: 26, category: "Diabetes", strength: "500mg", form: "Tablet" },
  { id: 57, name: "Pantoprazole 40mg Tablet", brand: "Mankind Pharma", basePrice: 40, category: "Gastric", strength: "40mg", form: "Tablet" },

  // Additional Medicines for other brands
  { id: 58, name: "Aspirin 75mg Tablet", brand: "Bayer", basePrice: 35, category: "Blood Thinner", strength: "75mg", form: "Tablet" },
  { id: 59, name: "Vitamin B12 1500mcg Tablet", brand: "Pfizer", basePrice: 95, category: "Supplements", strength: "1500mcg", form: "Tablet" },
  { id: 60, name: "Calcium 500mg Tablet", brand: "GSK", basePrice: 85, category: "Supplements", strength: "500mg", form: "Tablet" }
];

// All brands list
export const medicineBrands = [
  "Cipla",
  "Sun Pharma", 
  "Dr. Reddy's",
  "Abbott",
  "Mankind Pharma",
  "Bayer",
  "Pfizer",
  "GSK",
  "Novartis",
  "Sanofi",
  "Merck",
  "Roche",
  "AstraZeneca",
  "Johnson & Johnson"
];

// Get all medicines
export const getAllMedicines = () => {
  return medicinesDatabase;
};

// Get medicines by brand
export const getMedicinesByBrand = (brand) => {
  if (!brand) return [];
  return medicinesDatabase.filter(medicine => 
    medicine.brand.toLowerCase() === brand.toLowerCase()
  );
};

// Get unique medicine names (for dropdown)
export const getUniqueMedicineNames = () => {
  return [...new Set(medicinesDatabase.map(m => m.name))];
};

// Get base price for a specific medicine and brand
export const getMedicineBasePrice = (medicineName, brand) => {
  const medicine = medicinesDatabase.find(m => 
    m.name === medicineName && m.brand === brand
  );
  return medicine ? medicine.basePrice : null;
};

// Get full medicine details
export const getMedicineDetails = (medicineName, brand) => {
  return medicinesDatabase.find(m => 
    m.name === medicineName && m.brand === brand
  );
};

// Search medicines by name and brand
export const searchMedicines = (searchTerm, selectedBrand = null) => {
  let filtered = medicinesDatabase;
  
  if (selectedBrand) {
    filtered = filtered.filter(m => m.brand === selectedBrand);
  }
  
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(term) ||
      m.category.toLowerCase().includes(term)
    );
  }
  
  return filtered;
};

// Get all unique categories
export const getCategories = () => {
  return [...new Set(medicinesDatabase.map(m => m.category))];
};

// Get medicines by category
export const getMedicinesByCategory = (category, brand = null) => {
  let filtered = medicinesDatabase.filter(m => m.category === category);
  if (brand) {
    filtered = filtered.filter(m => m.brand === brand);
  }
  return filtered;
};

// Get price range for a medicine across brands
export const getPriceRange = (medicineName) => {
  const medicines = medicinesDatabase.filter(m => m.name === medicineName);
  if (medicines.length === 0) return null;
  
  const prices = medicines.map(m => m.basePrice);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: prices.reduce((a, b) => a + b, 0) / prices.length
  };
};

// Get all brands for a specific medicine
export const getBrandsForMedicine = (medicineName) => {
  const medicines = medicinesDatabase.filter(m => m.name === medicineName);
  return medicines.map(m => ({
    brand: m.brand,
    price: m.basePrice
  }));
};