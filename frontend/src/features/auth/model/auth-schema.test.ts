import { describe, expect, it } from "vitest";
import { createAuthSchema } from "./auth-schema";

describe("createAuthSchema", () => {
  it("exige un nom lors de l'inscription", () => {
    expect(createAuthSchema(true).safeParse({ email: "user@example.test", password: "password123", displayName: "" }).success).toBe(false);
  });

  it("n'exige pas le nom à la connexion", () => {
    expect(createAuthSchema(false).safeParse({ email: "user@example.test", password: "password123", displayName: "" }).success).toBe(true);
  });
});
