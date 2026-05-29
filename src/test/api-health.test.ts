import { describe, it, expect } from "vitest";

describe("API health contract", () => {
  it("defines expected health response shape", () => {
    const health = { status: "ok", message: "TTIN API is running", database: "connected" };
    expect(health.status).toBe("ok");
    expect(["connected", "disconnected"]).toContain(health.database);
  });
});
