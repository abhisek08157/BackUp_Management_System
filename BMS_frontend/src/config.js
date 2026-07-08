// Flip this to false once the Spring Boot backend on http://localhost:8080
// (see vite.config.js proxy) is running. All service files already call the
// real endpoints from the API spec — this flag only decides whether calls
// are short-circuited to the in-memory mock so the UI is demoable standalone.
export const DEMO_MODE = false;

export const API_BASE_URL = "http://localhost:8080/api";
