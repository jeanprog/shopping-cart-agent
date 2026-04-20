import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../db/schema";
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticate,
  type AuthRequest,
} from "../auth";
import {
  loginBodySchema,
  registerBodySchema,
  formatZodError,
} from "../validation/auth";
import { verifyGoogleIdToken } from "../services/googleAuth";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const parsed = registerBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }
    const { email, password } = parsed.data;

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
      })
      .returning();

    const token = generateToken(newUser.id);
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        onboardingCompleted: newUser.onboardingCompleted,
      },
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Falha no registro" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const parsed = loginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }
    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (
      !user ||
      !user.passwordHash ||
      !(await comparePassword(password, user.passwordHash))
    ) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Falha no login" });
  }
});

authRouter.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId!))
      .limit(1);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error) {
    console.error("GET /api/auth/me:", error);
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

authRouter.patch("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const { onboardingCompleted } = req.body ?? {};
    if (typeof onboardingCompleted !== "boolean") {
      return res
        .status(400)
        .json({ error: "onboardingCompleted (boolean) obrigatório" });
    }
    const [row] = await db
      .update(users)
      .set({ onboardingCompleted })
      .where(eq(users.id, req.userId!))
      .returning();
    if (!row) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatarUrl,
      onboardingCompleted: row.onboardingCompleted,
    });
  } catch (error) {
    console.error("PATCH /api/auth/me:", error);
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

authRouter.post("/google", async (req, res) => {
  try {
    const credential = req.body?.credential;
    if (typeof credential !== "string" || !credential.trim()) {
      return res.status(400).json({ error: "credential obrigatório" });
    }
    const profile = await verifyGoogleIdToken(credential);
    if (!profile || !profile.emailVerified) {
      return res
        .status(401)
        .json({ error: "Token Google inválido ou e-mail não verificado" });
    }

    const [bySub] = await db
      .select()
      .from(users)
      .where(eq(users.googleSub, profile.sub))
      .limit(1);
    if (bySub) {
      const token = generateToken(bySub.id);
      return res.json({
        token,
        user: {
          id: bySub.id,
          email: bySub.email,
          name: bySub.name,
          avatarUrl: bySub.avatarUrl,
          onboardingCompleted: bySub.onboardingCompleted,
        },
      });
    }

    const [byEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1);
    if (byEmail) {
      await db
        .update(users)
        .set({
          googleSub: profile.sub,
          name: profile.name ?? byEmail.name,
          avatarUrl: profile.picture ?? byEmail.avatarUrl,
        })
        .where(eq(users.id, byEmail.id));
      const token = generateToken(byEmail.id);
      return res.json({
        token,
        user: {
          id: byEmail.id,
          email: byEmail.email,
          name: profile.name ?? byEmail.name,
          avatarUrl: profile.picture ?? byEmail.avatarUrl,
          onboardingCompleted: byEmail.onboardingCompleted,
        },
      });
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email: profile.email,
        googleSub: profile.sub,
        name: profile.name ?? null,
        avatarUrl: profile.picture ?? null,
        passwordHash: null,
        onboardingCompleted: false,
      })
      .returning();

    if (!newUser) {
      return res.status(500).json({ error: "Falha ao criar usuário" });
    }
    const token = generateToken(newUser.id);
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        onboardingCompleted: newUser.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const isDev = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: "Falha no login com Google",
      ...(isDev && { details: msg }),
    });
  }
});
