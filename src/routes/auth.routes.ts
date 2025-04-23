// src/routes/auth.routes.ts
import { Router } from "express";
import { register, login, getUserProfile } from "@/controllers/auth.controller"; // 👈 IMPORTA BIEN AQUÍ
import { validateRegister } from "@/middlewares/validateRegister"; // 👈 IMPORTAR middleware de validación
import { validateLogin } from "@/middlewares/validateLogin";
import passport from "passport";
import { updateGoogleProfile } from "../controllers/auth.controller";
/* import { isAuthenticated } from "@/middlewares/isAuthenticated"; */


const router = Router();

/* router.patch("/update-profile", updateGoogleProfile); */

router.post("/google/complete-profile", updateGoogleProfile);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: 'http://localhost:3000?error=google',
      session: true,
    }),
    (req, res) => {
      // 🔥 Redirige al front para que abra el modal de completar perfil
      res.redirect("http://localhost:3000/home?googleComplete=true");
    }
  );
router.get("/auth/success", (req, res) => {
  res.send("Inicio de sesión con Google exitoso!");
});

router.patch("/update-profile", updateGoogleProfile);

router.get("/auth/failure", (req, res) => {
  res.send("Fallo al iniciar sesión con Google.");
});

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get('/user-profile/:id_usuario', getUserProfile);

passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/home?error=cuentaExistente",
    session: true,
  }),
  (req, res) => {
    res.redirect("http://localhost:3000/home?googleComplete=true");
  }
  

export default router;