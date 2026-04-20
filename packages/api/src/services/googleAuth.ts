import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
};

export async function verifyGoogleIdToken(
  credential: string,
): Promise<GoogleProfile | null> {
  const audience = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!audience) {
    console.error("GOOGLE_CLIENT_ID não configurado");
    return null;
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience,
    });
    const p = ticket.getPayload();
    if (!p?.sub || !p.email) return null;
    return {
      sub: p.sub,
      email: p.email,
      emailVerified: Boolean(p.email_verified),
      name: p.name,
      picture: p.picture,
    };
  } catch (e) {
    console.error("verifyGoogleIdToken:", e);
    return null;
  }
}
