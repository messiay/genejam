import { storage } from "./storage";

const diseasesData = [
  {
    name: "Dengue",
    category: "communicable",
    description: "A mosquito-borne viral infection causing flu-like illness, transmitted by Aedes mosquitoes.",
    symptoms: [
      "High fever",
      "Severe headache",
      "Pain behind eyes",
      "Joint and muscle pain",
      "Skin rash",
      "Mild bleeding"
    ],
    preventiveMeasures: [
      "Eliminate mosquito breeding sites by removing standing water",
      "Use mosquito repellents and wear protective clothing",
      "Install window screens and use mosquito nets",
      "Seek immediate medical attention if symptoms appear",
      "Community-wide mosquito control programs"
    ],
    treatment: "Rest, fluids, and pain relievers. Severe cases require hospitalization.",
    severity: "moderate",
    season: "monsoon",
    iconName: "Bug"
  },
  {
    name: "Malaria",
    category: "communicable",
    description: "A life-threatening disease caused by parasites transmitted through infected mosquito bites.",
    symptoms: [
      "High fever with chills",
      "Sweating",
      "Headache",
      "Nausea and vomiting",
      "Muscle pain",
      "Fatigue"
    ],
    preventiveMeasures: [
      "Sleep under insecticide-treated mosquito nets",
      "Use indoor residual spraying",
      "Take antimalarial medications as prescribed",
      "Wear long-sleeved clothes during dusk and dawn",
      "Eliminate standing water around homes"
    ],
    treatment: "Antimalarial medications as prescribed by healthcare providers. Early treatment is crucial.",
    severity: "severe",
    season: "monsoon",
    iconName: "Bug"
  },
  {
    name: "Diarrhea",
    category: "communicable",
    description: "Frequent loose or watery bowel movements, often caused by contaminated food or water.",
    symptoms: [
      "Loose watery stools",
      "Abdominal cramps",
      "Nausea",
      "Dehydration",
      "Fever (sometimes)",
      "Urgency to use bathroom"
    ],
    preventiveMeasures: [
      "Drink clean, boiled, or filtered water",
      "Wash hands thoroughly with soap before eating and after using toilet",
      "Eat freshly cooked food",
      "Practice proper food hygiene",
      "Ensure proper sanitation facilities"
    ],
    treatment: "Oral rehydration solution (ORS), rest, and medical consultation for severe cases.",
    severity: "mild",
    season: "year-round",
    iconName: "Droplets"
  },
  {
    name: "Typhoid",
    category: "communicable",
    description: "A bacterial infection caused by contaminated food and water, leading to prolonged fever.",
    symptoms: [
      "Sustained high fever",
      "Weakness and fatigue",
      "Abdominal pain",
      "Headache",
      "Loss of appetite",
      "Rose-colored spots on chest"
    ],
    preventiveMeasures: [
      "Get vaccinated against typhoid",
      "Drink safe, boiled water",
      "Eat thoroughly cooked food",
      "Maintain good hand hygiene",
      "Avoid street food and raw vegetables in endemic areas"
    ],
    treatment: "Antibiotics as prescribed. Complete the full course even if symptoms improve.",
    severity: "severe",
    season: "year-round",
    iconName: "Thermometer"
  },
  {
    name: "Tuberculosis (TB)",
    category: "communicable",
    description: "A bacterial infection primarily affecting the lungs, spread through airborne droplets.",
    symptoms: [
      "Persistent cough for 2+ weeks",
      "Coughing up blood",
      "Chest pain",
      "Fever and night sweats",
      "Weight loss",
      "Fatigue"
    ],
    preventiveMeasures: [
      "Get vaccinated with BCG vaccine",
      "Cover mouth when coughing or sneezing",
      "Ensure good ventilation in living spaces",
      "Complete full TB treatment if infected",
      "Avoid close contact with TB patients during active phase"
    ],
    treatment: "6-9 months of antibiotics. Must complete full treatment course to prevent drug resistance.",
    severity: "severe",
    season: "year-round",
    iconName: "Stethoscope"
  },
  {
    name: "Cholera",
    category: "communicable",
    description: "An acute diarrheal disease caused by contaminated water, can be fatal if untreated.",
    symptoms: [
      "Severe watery diarrhea",
      "Vomiting",
      "Rapid dehydration",
      "Muscle cramps",
      "Low blood pressure",
      "Weak pulse"
    ],
    preventiveMeasures: [
      "Drink only boiled or chlorinated water",
      "Practice proper hand hygiene",
      "Eat thoroughly cooked food",
      "Proper disposal of human waste",
      "Get vaccinated in high-risk areas"
    ],
    treatment: "Immediate rehydration with ORS or IV fluids. Antibiotics for severe cases.",
    severity: "severe",
    season: "monsoon",
    iconName: "Droplets"
  }
];

async function seedDiseases() {
  console.log("Seeding diseases...");
  
  for (const diseaseData of diseasesData) {
    try {
      const existing = await storage.getDiseaseByName(diseaseData.name);
      
      if (!existing) {
        await storage.createDisease(diseaseData);
        console.log(`✓ Created disease: ${diseaseData.name}`);
      } else {
        console.log(`- Disease already exists: ${diseaseData.name}`);
      }
    } catch (error) {
      console.error(`✗ Error creating ${diseaseData.name}:`, error);
    }
  }
  
  console.log("Disease seeding complete!");
}

// Run seeding
seedDiseases()
  .then(() => {
    console.log("All seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
