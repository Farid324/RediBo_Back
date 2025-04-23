import { PrismaClient } from '@prisma/client';
import { Request, Response } from "express";
import * as authService from "@/services/auth.service";
import { updateGoogleProfile as updateGoogleProfileService } from "../services/auth.service";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { nombre_completo, email, contraseña, fecha_nacimiento, telefono } =
    req.body;

  try {
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    const newUser = await authService.createUser({
      nombre_completo,
      email,
      contraseña,
      fecha_nacimiento,
      telefono,
    });

    return res
      .status(201)
      .json({
        message: "Usuario registrado exitosamente",
        user: { email: newUser.email },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const updateGoogleProfile = async (req: Request, res: Response) => {
  const { nombre_completo, fecha_nacimiento } = req.body;
  const email = req.user?.email;

  if (!email) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    const updatedUser = await authService.updateGoogleProfile(email, nombre_completo, fecha_nacimiento);
    res.json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error al actualizar perfil:", error);
    res.status(400).json({
      message:
        error.message || "No se pudo actualizar el perfil con Google",
    });
  }
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await authService.findUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Correo ingresado no se encuentra en el sistema." });
    }

    const isValid = await authService.validatePassword(password, user.contraseña ?? "");

    if (!isValid) {
      return res.status(401).json({ message: "Los datos no son válidos" });
    }

    return res.json({ message: "Login exitoso", user: { email: user.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  const id_usuario = Number(req.params.id_usuario); // Aseguramos que sea número

  if (isNaN(id_usuario)) {
    return res.status(400).json({ message: 'ID de usuario inválido' });
  }

  try {
    const user = await authService.getUserById(id_usuario); // Usamos el servicio

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Devolvemos los datos sin contraseña ni campos sensibles
    return res.status(200).json({
      id_usuario: user.id_usuario,
      nombre_completo: user.nombre_completo,
      email: user.email,
      telefono: user.telefono,
      fecha_nacimiento: user.fecha_nacimiento,
    });
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};















/*import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

import bcrypt from 'bcryptjs'; // 👈 Importar bcrypt

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { nombre_completo, email, contraseña, fecha_nacimiento, telefono} = req.body;
  

  try {

    if (!nombre_completo || !email || !contraseña || !fecha_nacimiento) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben estar completos." });
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado." });
    }

    // 🔒 ENCRIPTAR LA CONTRASEÑA AQUÍ
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    // 🔥 GUARDAR LA CONTRASEÑA ENCRIPTADA
    const newUser = await prisma.usuario.create({
      data: {
        nombre_completo,
        email,
        contraseña: hashedPassword, // 👈 Aquí guardamos la contraseña encriptada
        fecha_nacimiento: new Date(fecha_nacimiento),
        telefono: telefono ? Number(telefono) : null,
        registrado_con: "email",
        verificado: false,
        host: false,
        driver: false,
      },
    });

    return res.status(201).json({ message: "Usuario registrado exitosamente", user: { email: newUser.email } });
  }catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};*/