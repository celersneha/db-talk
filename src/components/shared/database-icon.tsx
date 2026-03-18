/**
 * Database Icon Component
 * Renders the appropriate icon for a database type
 * Client component for icon rendering
 */

"use client";

import { SiPostgresql, SiMysql } from "react-icons/si";
import type { IconType } from "@/utils/db-icons";

interface DatabaseIconProps {
  type: IconType;
  className?: string;
}

export function DatabaseIcon({
  type,
  className = "w-5 h-5",
}: DatabaseIconProps) {
  switch (type) {
    case "postgresql":
      return <SiPostgresql className={className} />;
    case "mysql":
      return <SiMysql className={className} />;
    default:
      return null;
  }
}
