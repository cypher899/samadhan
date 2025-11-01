// Environment configuration file for better IDE support and type safety

const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3108",
  FRONTEND_PORT: import.meta.env.VITE_FRONTEND_PORT || "3101",
  FRONTEND_BASE_URL:
    import.meta.env.VITE_FRONTEND_BASE_URL || "http://localhost:3101",

  // Add any other environment variables here
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
};

// Type checking helper (optional)
const validateConfig = () => {
  if (!config.API_BASE_URL) {
    console.warn("VITE_API_BASE_URL is not set, using default");
  }
};

validateConfig();

export default config;
