import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SessionData } from "./definitions";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATIONS_MS = 6 * 60 * 60 * 1000; // 6 hours
const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is not defined");
}

const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Retrieves the current session payload from the session cookie.
 * @returns The session payload if available and valid, otherwise null.
 */
export async function getSession(): Promise<SessionData | null> {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const payload = await decrypt(sessionToken);
  if (!payload) return null;

  return payload;
}

/**
 * Creates a new session by generating a JWT and setting it as a cookie.
 * @param sessionData - The data to include in the session payload.
 */
export async function createSession(sessionData: SessionData): Promise<void> {
  const expiresAt = getNewExpiryDate();
  const sessionToken = await encrypt(sessionData, expiresAt);
  await setSessionCookie(sessionToken, expiresAt);
}

/**
 * Updates the session by refreshing its expiry and setting a new cookie.
 * @returns The new session token if successful, otherwise null.
 */
export async function updateSession(): Promise<string | null> {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  const oldPayload = await decrypt(sessionToken);
  if (!oldPayload) return null;

  const expiresAt = getNewExpiryDate();
  const newToken = await encrypt(oldPayload, expiresAt);
  await setSessionCookie(newToken, expiresAt);

  return newToken;
}

/**
 * Deletes the session cookie, effectively logging the user out.
 */
export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

/**
 * Encrypts the session payload into a JWT.
 * @param payload - The session payload to encrypt.
 * @param expiresAt - The expiration date of the session.
 * @returns The signed JWT as a string.
 */
export async function encrypt(
  payload: SessionData,
  expiresAt: Date,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);
}

/**
 * Decrypts and verifies a JWT session token.
 * @param token - The JWT session token to decrypt.
 * @returns The session payload if valid, otherwise null.
 */
export async function decrypt(token: string): Promise<SessionData | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionData;
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie with the given token and expiry date.
 * @param token - The session token to set in the cookie.
 * @param expiresAt - The expiration date of the cookie.
 */
async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Calculates a new expiry date for the session.
 * @returns A Date object representing the new expiry time.
 */
function getNewExpiryDate(): Date {
  return new Date(Date.now() + SESSION_DURATIONS_MS);
}
