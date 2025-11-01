import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3101,
    host: "0.0.0.0", // Bind to all network interfaces
  },
  optimizeDeps: {
    include: ["react-apexcharts", "apexcharts"],
  },
  // Add environment variable validation
});
