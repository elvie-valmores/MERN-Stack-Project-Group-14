const request = require("supertest");

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../server");

describe("Authentication API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.sign.mockReturnValue("test-token");
  });

  test("POST /api/auth/register should reject missing fields", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "",
        email: "",
        password: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Please fill all fields"
    );
  });

  test("POST /api/auth/register should reject an existing user", async () => {
    User.findOne.mockResolvedValue({
      email: "test@example.com",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "User already exists"
    );
  });

  test("POST /api/auth/register should create a new user", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-password");

    User.create.mockResolvedValue({
      _id: "123456",
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password",
      steamId: "",
      steamName: "",
      steamAvatar: "",
      createdAt: new Date(),
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe("Test User");
    expect(response.body.email).toBe(
      "test@example.com"
    );
    expect(response.body.token).toBe("test-token");

    expect(bcrypt.hash).toHaveBeenCalledWith(
      "password123",
      10
    );
  });

  test("POST /api/auth/login should reject an unknown user", async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@example.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      "Invalid email or password"
    );
  });

  test("POST /api/auth/login should reject a wrong password", async () => {
    User.findOne.mockResolvedValue({
      _id: "123456",
      email: "test@example.com",
      password: "hashed-password",
    });

    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "wrong-password",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      "Invalid email or password"
    );
  });

  test("POST /api/auth/login should log in a valid user", async () => {
    User.findOne.mockResolvedValue({
      _id: "123456",
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password",
      steamId: "",
      steamName: "",
      steamAvatar: "",
      createdAt: new Date(),
    });

    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Test User");
    expect(response.body.email).toBe(
      "test@example.com"
    );
    expect(response.body.token).toBe("test-token");
  });
});
