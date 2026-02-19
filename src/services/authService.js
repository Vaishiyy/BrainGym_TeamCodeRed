const crypto = require("crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expectedHash] = String(storedHash || "").split(":");
  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const actualBuffer = Buffer.from(actualHash, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function createAuthService(userRepository) {
  function isValidDateOfBirth(value) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }
    return parsed <= new Date();
  }

  async function signup({ email, password, verifyPassword: verifyPasswordInput, name, dateOfBirth }) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const rawPassword = String(password || "");
    const rawVerifyPassword = String(verifyPasswordInput || "");
    const normalizedName = String(name || "").trim();
    const normalizedDob = String(dateOfBirth || "").trim();

    if (!normalizedEmail || !rawPassword || !rawVerifyPassword || !normalizedName || !normalizedDob) {
      throw new Error("All signup fields are required.");
    }

    if (rawPassword.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    if (rawPassword !== rawVerifyPassword) {
      throw new Error("Password and verify password must match.");
    }

    if (!isValidDateOfBirth(normalizedDob)) {
      throw new Error("Date of birth is invalid.");
    }

    const existingUser = await userRepository.findUserByEmail(normalizedEmail, { includePasswordHash: true });
    if (existingUser) {
      throw new Error("Account already exists for this email.");
    }

    const passwordHash = hashPassword(rawPassword);
    return userRepository.createUser({
      email: normalizedEmail,
      passwordHash,
      name: normalizedName,
      dateOfBirth: normalizedDob
    });
  }

  async function login({ email, password }) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const rawPassword = String(password || "");

    if (!normalizedEmail || !rawPassword) {
      throw new Error("Email and password are required.");
    }

    const user = await userRepository.findUserByEmail(normalizedEmail, { includePasswordHash: true });
    if (!user) {
      throw new Error("Account not found. Please sign up first.");
    }

    if (!verifyPassword(rawPassword, user.passwordHash)) {
      throw new Error("Incorrect password.");
    }

    await userRepository.recordLogin({
      userId: user._id,
      email: normalizedEmail
    });

    const sanitizedUser = await userRepository.findUserByEmail(normalizedEmail);

    return sanitizedUser;
  }

  return { signup, login };
}

module.exports = { createAuthService };
