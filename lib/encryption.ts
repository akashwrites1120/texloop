import crypto from "crypto";

// Get encryption key from environment (CHANGE IN PRODUCTION!)
// Resolved lazily so that env files loaded at startup are picked up first.
const DEFAULT_INSECURE_KEY = "your-32-character-secret-key!!";
const ALGORITHM = "aes-256-cbc";

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    console.warn(
      "WARNING: ENCRYPTION_KEY is not set. Falling back to an insecure default key — messages are NOT safely encrypted. Set ENCRYPTION_KEY in your environment."
    );
  }

  // Ensure key is 32 bytes
  cachedKey = crypto.scryptSync(secret || DEFAULT_INSECURE_KEY, "salt", 32);
  return cachedKey;
}

/**
 * Encrypt a message
 */
export function encryptMessage(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return IV + encrypted text (IV needed for decryption)
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt a message
 */
export function decryptMessage(encryptedText: string): string {
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Hash a password using bcrypt-style approach
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, originalHash] = hash.split(":");
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      const expected = Buffer.from(originalHash, "hex");
      const actual =
        derivedKey.length === expected.length && originalHash.length > 0
          ? derivedKey.subarray(0, expected.length)
          : Buffer.alloc(0);
      resolve(
        expected.length > 0 &&
          actual.length === expected.length &&
          crypto.timingSafeEqual(expected, actual)
      );
    });
  });
}

/**
 * Hash a message using SHA-256 for privacy
 * This is a one-way hash - messages cannot be decrypted
 */
export function hashMessage(message: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(message);
  return hash.digest("hex");
}
