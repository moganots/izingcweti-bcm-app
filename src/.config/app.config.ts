/**
 * Application Configuration Module
 * 
 * This module centralizes all application configuration settings loaded from
 * environment variables and package.json. It provides type-safe access to
 * configuration values across the entire application.
 * 
 * @description Centralized configuration for the BCM Mobile Application
 */

import { config } from "dotenv";
import {
  name,
  productName,
  description,
  version,
  company,
  author,
} from "./../../package.json";

// Load environment variables from .env file into process.env
// This must be called before accessing any environment variables
config();

/**
 * Centralized application configuration object
 * 
 * Organizes configuration into logical groups and provides fallback values
 * for all settings to ensure the application runs even when environment
 * variables are missing.
 */
export const AppConfig = {
  /**
   * Application core settings
   * 
   * Contains basic application metadata and runtime configuration
   * These values are primarily sourced from package.json with environment
   * variable overrides for runtime-specific settings.
   */
  app: {
    /**
     * Current runtime environment
     * Determines which features/behaviors are enabled
     */
    env: process.env.NODE_ENV || "development",
    
    /**
     * Application technical name (package name)
     * Used for internal identification and logging
     */
    name: name || "izingcweti-bcm-app",
    
    /**
     * User-facing application name
     * Displayed in UI headers, titles, and user communications
     */
    productName: productName || "Izingcweti - BCM App",
    
    /**
     * Application description
     * Used in about pages, metadata, and documentation
     */
    description:
      description || "Izingcweti Business Continuity Management Mobile App",
    
    /**
     * Application version (semantic versioning)
     * Used for API versioning, cache busting, and compatibility checks
     * 
     * Format: YY.MMDD.Revision (e.g., 26.0520.1)
     * - YY: Year
     * - MMDD: Month and Day
     * - Revision: Build number for that day
     */
    version: version || "26.0520.1",
    
    /**
     * Company information
     * Used for branding, legal notices, and contact information
     */
    company: {
      /**
       * Company name for branding and legal purposes
       */
      name: company.name || "Izingcweti",
      
      /**
       * Company contact information
       * Used for support emails, notifications, and user communications
       */
      contact: {
        /**
         * Email addresses for different purposes
         */
        email: {
          /**
           * General inquiries email
           * Used for general company communications
           */
          info: company.contact.email.info || "info@bcm.izingcweti.co.za",
          
          /**
           * Administrative email
           * Used for account management and administrative communications
           */
          admin: company.contact.email.admin || "admin@bcm.izingcweti.co.za",
          
          /**
           * Support email
           * Used for customer support and technical assistance
           */
          support:
            company.contact.email.support || "support@bcm.izingcweti.co.za",
        },
        
        /**
         * Company contact phone number
         * Used for support and emergency contacts
         */
        phone: company.contact.phone || "+27 (0) ** ****",
      },
    },
    
    /**
     * Application author/maintainer
     * Used for attribution and technical contact
     */
    author: author || "thabang.mogano@gmail.com",
    
    /**
     * Private package flag
     * Indicates this package should not be published to npm registry
     */
    private: true,
  },
};

export default AppConfig;