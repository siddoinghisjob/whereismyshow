import * as module from "super-fetch-proxy";

console.log("Module contents:", module);
console.log("Default export type:", typeof module.default);
console.log("Is constructor?", typeof module.default === "function" && /^\s*class\s+/.test(module.default.toString()));

if (typeof module.default === "function") {
  try {
    const instance = new module.default(async () => ["127.0.0.1:8080"]);
    console.log("Successfully created instance:", instance);
  } catch (e) {
    console.error("Error creating instance:", e.message);
  }
}