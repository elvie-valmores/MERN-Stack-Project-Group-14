const request = require("supertest");
const app = require("../server");

describe("Achievement Hub API", () => {
  test("GET / should return the API message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Achievement Hub API is running."
    );
  });

  test("Unknown route should return 404", async () => {
    const response = await request(app).get(
      "/this-route-does-not-exist"
    );

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe(
      "Route not found."
    );
  });
});
