import { beforeAll, afterAll, describe, test, expect } from 'vitest';
import request from 'supertest';
import { startServer } from '../index.js';

let server;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  server = await startServer(4000); // <--- startServer verwenden
});

afterAll(async () => {
  await server.close();
});

describe("🔐 Auth API", () => {
  test("sollte einen neuen Benutzer registrieren", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({
        email: "testuser@example.com",
        password: "testpassword"
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
