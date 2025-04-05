import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createServer } from "../index.js";

let app;

beforeAll(async () => {
  app = await createServer(); // wichtig: await!
});

describe("🔐 Auth API", () => {
  it("sollte einen neuen Benutzer registrieren", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `testuser${Date.now()}@example.com`,
        password: "supersecure123",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("userId");
  });
});
