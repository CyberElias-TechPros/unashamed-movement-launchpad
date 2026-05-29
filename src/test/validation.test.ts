import { describe, it, expect } from "vitest";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

const newsletterSchema = z.object({
  email: z.string().email(),
});

describe("validation schemas", () => {
  it("validates contact form", () => {
    expect(contactSchema.safeParse({ name: "A", email: "a@b.com", message: "Hi" }).success).toBe(true);
    expect(contactSchema.safeParse({ name: "", email: "bad", message: "" }).success).toBe(false);
  });

  it("validates newsletter email", () => {
    expect(newsletterSchema.safeParse({ email: "test@example.com" }).success).toBe(true);
  });
});
