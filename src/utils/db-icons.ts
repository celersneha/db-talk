/**
 * Database Icons Utility
 * Maps database types to their icon names and display information
 * Icons are rendered in client components using React Icons
 */

export type DatabaseType = "postgresql" | "mysql";
export type IconType = "postgresql" | "mysql";

export interface DatabaseConfig {
  name: string;
  displayName: string;
  iconType: IconType;
  urlPlaceholder: string;
  description: string;
}

export const DATABASE_CONFIGS: Record<DatabaseType, DatabaseConfig> = {
  postgresql: {
    name: "postgresql",
    displayName: "PostgreSQL",
    iconType: "postgresql",
    urlPlaceholder: "postgresql://user:password@host:5432/dbname",
    description: "Connect to your PostgreSQL database",
  },
  mysql: {
    name: "mysql",
    displayName: "MySQL",
    iconType: "mysql",
    urlPlaceholder: "mysql://user:password@host:3306/dbname",
    description: "Connect to your MySQL database",
  },
};

export const DATABASE_TYPES: DatabaseType[] = ["postgresql", "mysql"];

/**
 * Get database configuration by type
 */
export function getDatabaseConfig(dbType: DatabaseType): DatabaseConfig {
  return DATABASE_CONFIGS[dbType];
}

/**
 * Get display name for a database type
 */
export function getDatabaseDisplayName(dbType: DatabaseType): string {
  return DATABASE_CONFIGS[dbType].displayName;
}

/**
 * Get URL placeholder for a database type
 */
export function getDatabasePlaceholder(dbType: DatabaseType): string {
  return DATABASE_CONFIGS[dbType].urlPlaceholder;
}

/**
 * Get description for a database type
 */
export function getDatabaseDescription(dbType: DatabaseType): string {
  return DATABASE_CONFIGS[dbType].description;
}

/**
 * Get icon type for a database type
 */
export function getDatabaseIconType(dbType: DatabaseType): IconType {
  return DATABASE_CONFIGS[dbType].iconType;
}
