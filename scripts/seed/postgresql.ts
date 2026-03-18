/**
 * PostgreSQL Database Seeding Script
 * Executes init-postgres.sql to seed the database with sample data
 * Run this after: docker compose up -d
 */

import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

// Database connection string
const DB_URL = "postgresql://dbuser:dbpassword@localhost:5432/healthcare";

// Wait for database to be ready
async function waitForDatabase(maxAttempts: number = 30): Promise<void> {
  console.log("⏳ Waiting for PostgreSQL database to be ready...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = new Client({ connectionString: DB_URL });

    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      console.log("✅ PostgreSQL database is ready!");
      return;
    } catch (error) {
      await client.end().catch(() => {});

      if (attempt === maxAttempts) {
        throw new Error(
          "PostgreSQL database failed to become ready in time. Make sure Docker containers are running: docker compose up -d",
        );
      }

      console.log(`Attempt ${attempt}/${maxAttempts} - waiting...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

// Execute SQL from init-postgres.sql file
async function executeSeedSQL(client: Client): Promise<void> {
  const initSqlPath = path.join(__dirname, "init-postgres.sql");

  if (!fs.existsSync(initSqlPath)) {
    throw new Error(
      "init-postgres.sql not found! Please run: npm run setup-db:postgres first",
    );
  }

  console.log("\n📊 Reading init-postgres.sql...");
  const sqlContent = fs.readFileSync(initSqlPath, "utf-8");

  console.log("🌱 Executing seed SQL...");
  await client.query(sqlContent);
  console.log("✅ PostgreSQL database seeded successfully!");
}

// Data summary row type
interface CountResult {
  count: string;
}

// Display data summary
async function displaySummary(client: Client): Promise<void> {
  console.log("\n📊 Data Summary:");

  const patientCount = await client.query<CountResult>(
    "SELECT COUNT(*) FROM patients",
  );
  const doctorCount = await client.query<CountResult>(
    "SELECT COUNT(*) FROM doctors",
  );
  const appointmentCount = await client.query<CountResult>(
    "SELECT COUNT(*) FROM appointments",
  );
  const recordCount = await client.query<CountResult>(
    "SELECT COUNT(*) FROM medical_records",
  );
  const prescriptionCount = await client.query<CountResult>(
    "SELECT COUNT(*) FROM prescriptions",
  );

  console.log(`   Patients: ${patientCount.rows[0].count}`);
  console.log(`   Doctors: ${doctorCount.rows[0].count}`);
  console.log(`   Appointments: ${appointmentCount.rows[0].count}`);
  console.log(`   Medical Records: ${recordCount.rows[0].count}`);
  console.log(`   Prescriptions: ${prescriptionCount.rows[0].count}`);

  const total =
    parseInt(patientCount.rows[0].count) +
    parseInt(doctorCount.rows[0].count) +
    parseInt(appointmentCount.rows[0].count) +
    parseInt(recordCount.rows[0].count) +
    parseInt(prescriptionCount.rows[0].count);

  console.log(`   Total Entries: ${total}`);
}

// Main execution
async function main(): Promise<void> {
  try {
    console.log("🚀 Starting PostgreSQL database seeding...\n");

    // Step 1: Wait for database to be ready
    await waitForDatabase();

    // Step 2: Connect to database
    const client = new Client({ connectionString: DB_URL });
    await client.connect();
    console.log("✅ Connected to PostgreSQL database");

    // Step 3: Execute seed SQL
    await executeSeedSQL(client);

    // Step 4: Display summary
    await displaySummary(client);

    // Cleanup
    await client.end();

    console.log("\n✨ PostgreSQL database seeding completed successfully!");
    console.log("\n📝 Connection Details:");
    console.log(`   URL: ${DB_URL}`);
    console.log(`   Adminer: http://localhost:8080`);
    console.log(`   Database: healthcare`);
    console.log(`   Username: dbuser`);
    console.log(`   Password: dbpassword`);
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    process.exit(1);
  }
}

main();
