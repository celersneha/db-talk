/**
 * MySQL Database Seeding Script
 * Executes init-mysql.sql to seed the database with sample data
 * Run this after: docker compose -f docker-compose-mysql.yml up -d
 */

import * as mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";

// Database connection config type
interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Database connection config
const DB_CONFIG: MySQLConfig = {
  host: "localhost",
  port: 3306,
  user: "dbuser",
  password: "dbpassword",
  database: "healthcare",
};

const DB_URL = `mysql://${DB_CONFIG.user}:${DB_CONFIG.password}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`;

// Count result type
interface CountRow {
  count: number;
}

// Wait for database to be ready
async function waitForDatabase(maxAttempts: number = 30): Promise<void> {
  console.log("⏳ Waiting for MySQL database to be ready...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const connection = await mysql.createConnection(DB_CONFIG);
      await connection.ping();
      await connection.end();
      console.log("✅ MySQL database is ready!");
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(
          "MySQL database failed to become ready in time. Make sure Docker containers are running: docker compose -f docker-compose-mysql.yml up -d",
        );
      }

      console.log(`Attempt ${attempt}/${maxAttempts} - waiting...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

// Execute SQL from init-mysql.sql file
async function executeSeedSQL(connection: mysql.Connection): Promise<void> {
  const initSqlPath = path.join(__dirname, "init-mysql.sql");

  if (!fs.existsSync(initSqlPath)) {
    throw new Error(
      "init-mysql.sql not found! Please run: npm run setup-db:mysql first",
    );
  }

  console.log("\n📊 Reading init-mysql.sql...");
  const sqlContent = fs.readFileSync(initSqlPath, "utf-8");

  // Parse SQL statements more intelligently - handle multi-line statements
  const statements: string[] = [];
  let currentStatement = "";

  for (const line of sqlContent.split("\n")) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("--")) {
      continue;
    }

    currentStatement += " " + trimmedLine;

    // When we find a semicolon, we've found a complete statement
    if (trimmedLine.endsWith(";")) {
      statements.push(currentStatement.trim());
      currentStatement = "";
    }
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  console.log(`🌱 Found ${statements.length} statements to execute...`);
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await connection.query(statement);
      successCount++;
    } catch (error) {
      errorCount++;
      if (i < 3) {
        // Log first few errors
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(
          `  ⚠️  [${i + 1}/${statements.length}] ${statement.substring(0, 50)}... => ${errorMsg.substring(0, 80)}`,
        );
      }
    }
  }

  console.log(`✅ MySQL database seeded successfully!`);
  console.log(`   Total Statements: ${statements.length}`);
  console.log(`   Executed: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
}

// Display data summary
async function displaySummary(connection: mysql.Connection): Promise<void> {
  console.log("\n📊 Data Summary:");

  try {
    const [patientRows] = (await connection.query(
      "SELECT COUNT(*) as count FROM patients",
    )) as [CountRow[], mysql.FieldPacket[]];
    const [doctorRows] = (await connection.query(
      "SELECT COUNT(*) as count FROM doctors",
    )) as [CountRow[], mysql.FieldPacket[]];
    const [appointmentRows] = (await connection.query(
      "SELECT COUNT(*) as count FROM appointments",
    )) as [CountRow[], mysql.FieldPacket[]];
    const [recordRows] = (await connection.query(
      "SELECT COUNT(*) as count FROM medical_records",
    )) as [CountRow[], mysql.FieldPacket[]];
    const [prescriptionRows] = (await connection.query(
      "SELECT COUNT(*) as count FROM prescriptions",
    )) as [CountRow[], mysql.FieldPacket[]];

    const patientCount = patientRows[0].count;
    const doctorCount = doctorRows[0].count;
    const appointmentCount = appointmentRows[0].count;
    const recordCount = recordRows[0].count;
    const prescriptionCount = prescriptionRows[0].count;

    console.log(`   Patients: ${patientCount}`);
    console.log(`   Doctors: ${doctorCount}`);
    console.log(`   Appointments: ${appointmentCount}`);
    console.log(`   Medical Records: ${recordCount}`);
    console.log(`   Prescriptions: ${prescriptionCount}`);

    const total =
      patientCount +
      doctorCount +
      appointmentCount +
      recordCount +
      prescriptionCount;

    console.log(`   Total Entries: ${total}`);
  } catch (error) {
    console.log("   (Unable to retrieve summary)");
  }
}

// Main execution
async function main(): Promise<void> {
  let connection: mysql.Connection | null = null;

  try {
    console.log("🚀 Starting MySQL database seeding...\n");

    // Step 1: Wait for database to be ready
    await waitForDatabase();

    // Step 2: Connect to database
    connection = await mysql.createConnection(DB_CONFIG);
    console.log("✅ Connected to MySQL database");

    // Step 3: Execute seed SQL
    await executeSeedSQL(connection);

    // Step 4: Display summary
    await displaySummary(connection);

    console.log("\n✨ MySQL database seeding completed successfully!");
    console.log("\n📝 Connection Details:");
    console.log(`   URL: ${DB_URL}`);
    console.log(`   Adminer: http://localhost:8081`);
    console.log(`   Database: healthcare`);
    console.log(`   Username: dbuser`);
    console.log(`   Password: dbpassword`);
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    // Cleanup
    if (connection) {
      await connection.end().catch(() => {});
    }
  }
}

main();
