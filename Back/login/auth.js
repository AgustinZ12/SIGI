import express from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validarAtributosLogin from "../middlewares/validarAtributosLogin.js";
import { db } from "../db.js";
import { ExtractJwt, Strategy } from "passport-jwt";
import passport from "passport";

const router = express.Router();

export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      next(null, payload);
    })
  );
}

router.post("/login", validarAtributosLogin(), async (req, res) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    return res.status(400).send({ errores: validacion.array() });
  }

  const { email, password } = req.body;

  const [usuarios] = await db.execute("select * from usuarios where email=?", [
    email,
  ]);

  if (usuarios.length === 0) {
    return res.status(400).send({ error: "Usuario o contraseña inválida" });
  }

  const passwordComparada = await bcrypt.compare(
    password,
    usuarios[0].password
  );
  if (!passwordComparada) {
    return res.status(400).send({ error: "Usuario o contraseña inválida" });
  }

  const [roles] = await db.execute("select nombre from roles where id_rol=?", [
    usuarios[0].id_rol,
  ]);

  if (roles.length === 0) {
    return res.status(500).send({ error: "Error interno" });
  }

  // Crear jwt
  const payload = { usuarioId: usuarios[0].id_usuario, rol: roles[0].nombre };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  // Enviar jwt
  res.send({ token });
});

export default router;