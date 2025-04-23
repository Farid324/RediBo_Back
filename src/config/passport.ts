import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "http://localhost:3001/api/auth/google/callback",
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0].value;

    if (!email) {
      return done(new Error("No se pudo obtener el email de Google"), false);
    }
    
    let user = await prisma.usuario.findUnique({ where: { email } });  // ✅ Ahora email es string seguro

    if (!user) {
      user = await prisma.usuario.create({
        data: {
          email,
          nombre_completo: profile.displayName || "", registrado_con: 'google',
        },
      });
    }

    done(null, user);
  } catch (error) {
    done(error, undefined);
  }
}));

// 🟢 Serialización de sesión
passport.serializeUser((user: any, done) => {
  done(null, user.email); // Guardás el email en la sesión
});

passport.deserializeUser(async (email: string, done) => {
  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});
