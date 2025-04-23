import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { nombre_completo, email, contraseña, fecha_nacimiento } = req.body;

  if (!nombre_completo || !email || !contraseña || !fecha_nacimiento) {
    return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos.' });
  }

  next();
};
