import { describe, it, expect } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { formatUser } = require("../../server/utils/formatUser.js");

describe("formatUser", () => {
  it("maps mongoose user to API shape", () => {
    const user = {
      _id: { toString: () => "abc123" },
      email: "admin@thetimeisnow.com",
      name: "Admin",
      role: "admin",
    };
    expect(formatUser(user)).toEqual({
      id: "abc123",
      email: "admin@thetimeisnow.com",
      name: "Admin",
      role: "admin",
      avatar: "",
      emailVerified: false,
    });
  });
});
