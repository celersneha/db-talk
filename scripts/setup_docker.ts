/**
 * Database Setup Script
 * Automatically creates docker-compose.yml, init.sql, and updates README
 * Run this first, then manually run: docker compose up -d
 * Then run: npm run seed
 */

import * as fs from "fs";
import * as path from "path";

// Docker Compose configuration with Postgres 15 and Adminer
const DOCKER_COMPOSE_CONTENT = `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: db-talk-postgres
    environment:
      POSTGRES_USER: dbuser
      POSTGRES_PASSWORD: dbpassword
      POSTGRES_DB: healthcare
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dbuser -d healthcare"]
      interval: 5s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer:latest
    container_name: db-talk-adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
`;

// Database connection string
const DB_URL = "postgresql://dbuser:dbpassword@localhost:5432/healthcare";

// Generate init.sql with 50 entries per table
function generateInitSQL(): string {
  const sql: string[] = [];

  // Drop existing tables
  sql.push(`-- Drop existing tables for clean setup`);
  sql.push(`DROP TABLE IF EXISTS prescriptions CASCADE;`);
  sql.push(`DROP TABLE IF EXISTS appointments CASCADE;`);
  sql.push(`DROP TABLE IF EXISTS medical_records CASCADE;`);
  sql.push(`DROP TABLE IF EXISTS doctors CASCADE;`);
  sql.push(`DROP TABLE IF EXISTS patients CASCADE;`);
  sql.push(``);

  // Create patients table
  sql.push(`-- Create patients table`);
  sql.push(`CREATE TABLE patients (`);
  sql.push(`  id SERIAL PRIMARY KEY,`);
  sql.push(`  name VARCHAR(255) NOT NULL,`);
  sql.push(`  email VARCHAR(255) UNIQUE NOT NULL,`);
  sql.push(`  phone VARCHAR(20),`);
  sql.push(`  date_of_birth DATE NOT NULL,`);
  sql.push(`  gender VARCHAR(10),`);
  sql.push(`  address TEXT,`);
  sql.push(`  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`);
  sql.push(`  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  sql.push(`);`);
  sql.push(``);

  // Create doctors table
  sql.push(`-- Create doctors table`);
  sql.push(`CREATE TABLE doctors (`);
  sql.push(`  id SERIAL PRIMARY KEY,`);
  sql.push(`  name VARCHAR(255) NOT NULL,`);
  sql.push(`  email VARCHAR(255) UNIQUE NOT NULL,`);
  sql.push(`  phone VARCHAR(20),`);
  sql.push(`  specialization VARCHAR(100) NOT NULL,`);
  sql.push(`  license_number VARCHAR(50) UNIQUE NOT NULL,`);
  sql.push(`  years_of_experience INTEGER,`);
  sql.push(`  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`);
  sql.push(`  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  sql.push(`);`);
  sql.push(``);

  // Create appointments table
  sql.push(`-- Create appointments table`);
  sql.push(`CREATE TABLE appointments (`);
  sql.push(`  id SERIAL PRIMARY KEY,`);
  sql.push(
    `  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,`,
  );
  sql.push(
    `  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,`,
  );
  sql.push(`  appointment_date TIMESTAMP NOT NULL,`);
  sql.push(`  status VARCHAR(20) DEFAULT 'scheduled',`);
  sql.push(`  reason TEXT,`);
  sql.push(`  notes TEXT,`);
  sql.push(`  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`);
  sql.push(`  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  sql.push(`);`);
  sql.push(``);

  // Create medical_records table
  sql.push(`-- Create medical_records table`);
  sql.push(`CREATE TABLE medical_records (`);
  sql.push(`  id SERIAL PRIMARY KEY,`);
  sql.push(
    `  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,`,
  );
  sql.push(
    `  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,`,
  );
  sql.push(`  diagnosis TEXT NOT NULL,`);
  sql.push(`  symptoms TEXT,`);
  sql.push(`  treatment TEXT,`);
  sql.push(`  visit_date TIMESTAMP NOT NULL,`);
  sql.push(`  notes TEXT,`);
  sql.push(`  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`);
  sql.push(`  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  sql.push(`);`);
  sql.push(``);

  // Create prescriptions table
  sql.push(`-- Create prescriptions table`);
  sql.push(`CREATE TABLE prescriptions (`);
  sql.push(`  id SERIAL PRIMARY KEY,`);
  sql.push(
    `  medical_record_id INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,`,
  );
  sql.push(`  medication_name VARCHAR(255) NOT NULL,`);
  sql.push(`  dosage VARCHAR(100) NOT NULL,`);
  sql.push(`  frequency VARCHAR(100) NOT NULL,`);
  sql.push(`  duration VARCHAR(100),`);
  sql.push(`  instructions TEXT,`);
  sql.push(`  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`);
  sql.push(`  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  sql.push(`);`);
  sql.push(``);

  // Sample data arrays
  const firstNames = [
    "John",
    "Emma",
    "Michael",
    "Sophia",
    "William",
    "Olivia",
    "James",
    "Ava",
    "Robert",
    "Isabella",
    "David",
    "Mia",
    "Richard",
    "Charlotte",
    "Joseph",
    "Amelia",
    "Thomas",
    "Harper",
    "Charles",
    "Evelyn",
    "Daniel",
    "Abigail",
    "Matthew",
    "Emily",
    "Anthony",
    "Elizabeth",
    "Mark",
    "Sofia",
    "Donald",
    "Avery",
    "Steven",
    "Ella",
    "Paul",
    "Scarlett",
    "Andrew",
    "Grace",
    "Joshua",
    "Chloe",
    "Kenneth",
    "Victoria",
    "Kevin",
    "Madison",
    "Brian",
    "Luna",
    "George",
    "Hannah",
    "Edward",
    "Lily",
    "Ronald",
    "Aria",
    "Timothy",
    "Layla",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
    "Walker",
    "Young",
    "Allen",
    "King",
    "Wright",
    "Scott",
    "Torres",
    "Nguyen",
    "Hill",
    "Flores",
    "Green",
    "Adams",
    "Nelson",
    "Baker",
    "Hall",
    "Rivera",
    "Campbell",
    "Mitchell",
    "Carter",
    "Roberts",
  ];

  const specializations = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Dermatology",
    "General Practice",
    "Psychiatry",
    "Oncology",
    "Radiology",
    "Anesthesiology",
    "Ophthalmology",
    "Gastroenterology",
    "Endocrinology",
    "Nephrology",
    "Pulmonology",
    "Rheumatology",
    "Urology",
    "Otolaryngology",
    "Hematology",
    "Pathology",
  ];

  const statuses = ["scheduled", "completed", "cancelled", "no-show"];

  const diagnoses = [
    "Hypertension",
    "Type 2 Diabetes",
    "Asthma",
    "Migraine",
    "Anxiety Disorder",
    "Common Cold",
    "Allergic Rhinitis",
    "Lower Back Pain",
    "Gastritis",
    "Insomnia",
    "Osteoarthritis",
    "Depression",
    "GERD",
    "Hypothyroidism",
    "Chronic Bronchitis",
    "Urinary Tract Infection",
    "Sinusitis",
    "Anemia",
    "Vertigo",
    "Eczema",
  ];

  const medications = [
    "Lisinopril",
    "Metformin",
    "Albuterol",
    "Omeprazole",
    "Sertraline",
    "Levothyroxine",
    "Amoxicillin",
    "Ibuprofen",
    "Simvastatin",
    "Losartan",
    "Amlodipine",
    "Atorvastatin",
    "Gabapentin",
    "Hydrochlorothiazide",
    "Prednisone",
    "Azithromycin",
    "Ciprofloxacin",
    "Clopidogrel",
    "Montelukast",
    "Pantoprazole",
  ];

  // Insert 50 patients
  sql.push(`-- Insert 50 patients`);
  for (let i = 0; i < 50; i++) {
    const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const email = `patient${i + 1}@example.com`;
    const phone = `555-${String(1000 + i).padStart(4, "0")}`;
    const year = 1950 + Math.floor((i * 13) % 50);
    const month = String((i % 12) + 1).padStart(2, "0");
    const day = String(((i * 7) % 28) + 1).padStart(2, "0");
    const dob = `${year}-${month}-${day}`;
    const gender = i % 2 === 0 ? "Male" : "Female";
    const address = `${100 + i} Main St, City, State ${10000 + i}`;

    sql.push(
      `INSERT INTO patients (name, email, phone, date_of_birth, gender, address) VALUES ('${name}', '${email}', '${phone}', '${dob}', '${gender}', '${address}');`,
    );
  }
  sql.push(``);

  // Insert 50 doctors
  sql.push(`-- Insert 50 doctors`);
  for (let i = 0; i < 50; i++) {
    const name = `Dr. ${firstNames[(i + 10) % firstNames.length]} ${lastNames[(i + 15) % lastNames.length]}`;
    const email = `doctor${i + 1}@hospital.com`;
    const phone = `555-${String(2000 + i).padStart(4, "0")}`;
    const specialization = specializations[i % specializations.length];
    const licenseNumber = `MD-${String(100000 + i).padStart(6, "0")}`;
    const experience = 5 + (i % 30);

    sql.push(
      `INSERT INTO doctors (name, email, phone, specialization, license_number, years_of_experience) VALUES ('${name}', '${email}', '${phone}', '${specialization}', '${licenseNumber}', ${experience});`,
    );
  }
  sql.push(``);

  // Insert 50 appointments
  sql.push(`-- Insert 50 appointments`);
  for (let i = 0; i < 50; i++) {
    const patientId = (i % 50) + 1;
    const doctorId = ((i * 3) % 50) + 1;
    const daysOffset = (i % 90) - 30;
    const today = new Date();
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + daysOffset);
    const hours = 9 + (i % 8);
    appointmentDate.setHours(hours, 0, 0, 0);
    const dateStr = appointmentDate.toISOString().split(".")[0];
    const status = statuses[i % statuses.length];
    const reason = `Consultation for ${diagnoses[i % diagnoses.length]}`;

    sql.push(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason) VALUES (${patientId}, ${doctorId}, '${dateStr}', '${status}', '${reason}');`,
    );
  }
  sql.push(``);

  // Insert 50 medical records
  sql.push(`-- Insert 50 medical records`);
  for (let i = 0; i < 50; i++) {
    const patientId = (i % 50) + 1;
    const doctorId = ((i * 2) % 50) + 1;
    const diagnosis = diagnoses[i % diagnoses.length];
    const symptoms = `Patient reports symptoms including ${diagnosis.toLowerCase()}-related issues`;
    const treatment = `Prescribed medication and recommended lifestyle modifications`;
    const daysAgo = i % 180;
    const today = new Date();
    const visitDate = new Date(today);
    visitDate.setDate(today.getDate() - daysAgo);
    const dateStr = visitDate.toISOString().split(".")[0];

    sql.push(
      `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, symptoms, treatment, visit_date) VALUES (${patientId}, ${doctorId}, '${diagnosis}', '${symptoms}', '${treatment}', '${dateStr}');`,
    );
  }
  sql.push(``);

  // Insert 50 prescriptions
  sql.push(`-- Insert 50 prescriptions`);
  for (let i = 0; i < 50; i++) {
    const medicalRecordId = (i % 50) + 1;
    const medication = medications[i % medications.length];
    const dosages = ["25mg", "50mg", "100mg", "200mg", "500mg"];
    const dosage = dosages[i % dosages.length];
    const frequencies = [
      "Once daily",
      "Twice daily",
      "Three times daily",
      "As needed",
    ];
    const frequency = frequencies[i % frequencies.length];
    const durations = [
      "1 week",
      "2 weeks",
      "3 weeks",
      "4 weeks",
      "1 month",
      "2 months",
    ];
    const duration = durations[i % durations.length];
    const instructions = "Take with food and plenty of water";

    sql.push(
      `INSERT INTO prescriptions (medical_record_id, medication_name, dosage, frequency, duration, instructions) VALUES (${medicalRecordId}, '${medication}', '${dosage}', '${frequency}', '${duration}', '${instructions}');`,
    );
  }
  sql.push(``);

  return sql.join("\n");
}

// Create docker-compose.yml file
function createDockerCompose(): void {
  const rootDir = path.join(__dirname, "..");
  const dockerComposePath = path.join(rootDir, "docker-compose.yml");

  fs.writeFileSync(dockerComposePath, DOCKER_COMPOSE_CONTENT);
  console.log("✅ Created docker-compose.yml");
}

// Create init.sql file
function createInitSQL(): void {
  const scriptsDir = __dirname;
  const initSqlPath = path.join(scriptsDir, "init.sql");

  const sqlContent = generateInitSQL();
  fs.writeFileSync(initSqlPath, sqlContent);
  console.log("✅ Created init.sql with 50 entries per table");
}

// Update README with database setup instructions
function updateREADME(): void {
  const rootDir = path.join(__dirname, "..");
  const readmePath = path.join(rootDir, "README.md");

  const databaseSection = `
## Database Setup (Optional)

For testing purposes, you can set up a local PostgreSQL database with sample healthcare data.

### 1. Generate Database Files

Run the setup script to generate \`docker-compose.yml\` and \`init.sql\`:

\`\`\`bash
npm run setup-db
# or
tsx scripts/setup_docker.ts
\`\`\`

This will create:
- \`docker-compose.yml\` - Docker Compose configuration with Postgres 15 and Adminer
- \`scripts/init.sql\` - SQL file with 50 entries for each table (patients, doctors, appointments, medical_records, prescriptions)

### 2. Start Docker Containers

\`\`\`bash
docker compose up -d
\`\`\`

This starts:
- **PostgreSQL 15** on port 5432
- **Adminer** (database management UI) on port 8080

### 3. Seed the Database

\`\`\`bash
npm run seed
# or
tsx scripts/seed_data.ts
\`\`\`

### 4. Access the Database

**Connection URL:**
\`\`\`
postgresql://dbuser:dbpassword@localhost:5432/healthcare
\`\`\`

**Adminer UI:**
- URL: http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: dbuser
- Password: dbpassword
- Database: healthcare

### 5. Stop Docker Containers

\`\`\`bash
docker compose down
\`\`\`

### Database Schema

The sample database includes 5 tables with 50 entries each:

- **patients** - Patient information (name, email, phone, DOB, gender, address)
- **doctors** - Doctor information (name, email, specialization, license, experience)
- **appointments** - Scheduled appointments between patients and doctors
- **medical_records** - Medical visit records with diagnoses and treatments
- **prescriptions** - Medication prescriptions linked to medical records

`;

  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, "utf-8");

    // Remove existing database setup section if present
    const dbSectionRegex = /## Database Setup \(Optional\)[\s\S]*?(?=\n## |$)/;
    content = content.replace(dbSectionRegex, "");

    // Add database section after "How to Use" section
    const howToUseRegex = /(## How to Use[\s\S]*?)(\n## )/;
    if (howToUseRegex.test(content)) {
      content = content.replace(howToUseRegex, `$1\n${databaseSection}$2`);
    } else {
      // If "How to Use" section not found, append at the end
      content += "\n" + databaseSection;
    }

    fs.writeFileSync(readmePath, content);
    console.log("✅ Updated README.md with database setup instructions");
  } else {
    console.log("⚠️  README.md not found, skipping update");
  }
}

// Create package.json scripts if not present
function updatePackageJsonScripts(): void {
  const rootDir = path.join(__dirname, "..");
  const packageJsonPath = path.join(rootDir, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    let updated = false;

    if (!packageJson.scripts["setup-db"]) {
      packageJson.scripts["setup-db"] = "tsx scripts/setup_docker.ts";
      updated = true;
    }

    if (!packageJson.scripts["seed"]) {
      packageJson.scripts["seed"] = "tsx scripts/seed_data.ts";
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + "\n",
      );
      console.log("✅ Updated package.json with database scripts");
    } else {
      console.log("📄 package.json scripts already configured");
    }
  }
}

// Main execution
async function main() {
  try {
    console.log("🚀 Starting database setup file generation...\n");

    // Step 1: Create docker-compose.yml
    createDockerCompose();

    // Step 2: Create init.sql with 50 entries per table
    createInitSQL();

    // Step 3: Update README
    updateREADME();

    // Step 4: Update package.json scripts
    updatePackageJsonScripts();

    console.log("\n✨ Setup files created successfully!");
    console.log("\n📝 Next Steps:");
    console.log("   1. Start Docker containers:");
    console.log("      docker compose up -d");
    console.log("");
    console.log(
      "   2. Wait for containers to be ready (check with: docker ps)",
    );
    console.log("");
    console.log("   3. Seed the database:");
    console.log("      npm run seed");
    console.log("");
    console.log("   4. Access Adminer at: http://localhost:8080");
    console.log(
      "   5. Use connection URL: postgresql://dbuser:dbpassword@localhost:5432/healthcare",
    );
  } catch (error) {
    console.error("\n❌ Error during setup:", error);
    process.exit(1);
  }
}

// Run the script
main();
