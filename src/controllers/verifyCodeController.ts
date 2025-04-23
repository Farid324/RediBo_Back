import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
//import { resetAttempts } from '../utils/attemptStore';

const prisma = new PrismaClient();
const userData = { emailBD: '', codeBD: '',};

export const codeverifyController = async (data: { emailBD: string, codeBD: string }): Promise<any> => {
  const { emailBD, codeBD } = data;
  console.log('Datos en el controlador de verificación de código:', data);
  // Asignar las variables locales dentro de la función
  userData.emailBD = data.emailBD;
  userData.codeBD = data.codeBD;
}

/*/ Function to verify the code received in the request
export const verifyCode = async (req: Request): Promise<string> => {
  const { code } = req.body; // Get the code from request body
  console.log('🧪 Código recibido:', code, userData.codeBD); // Log the received code
  return code; // Return the received code for comparison
};*/


export const verifyCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { code } = req.body;
  
  console.log('🧪 Código recibido:', code, userData.codeBD);

  
  if (!code || code.trim().length !== 6) {
    res.status(400).json({ message: 'Código inválido' });
    return;
  }
  
  try {
    const user = await prisma.usuario.findFirst({
      where: {
        email: userData.emailBD, 
        //codigoVerificacion: code.trim(),
      },
    });
    
    let updatedUser = await prisma.usuario.update({
      where: { email: userData.emailBD },
      data: {} // Provide a valid object, even if empty
    });

    //if ((user?.failedCodeAttempts ?? 0) <= 5){
    if (!user?.isBlocked){
      const isCodeValid = user && code.trim() === user.codigoVerificacion;

      if (isCodeValid) {
        console.log('Código verificado correctamente');

        // Reset failed login attempts after successful login
        await prisma.usuario.update({
          where: { email: user?.email ?? '' },
          data: {
            failedCodeAttempts: 0,
          },
        });
        res.status(200).json({ message: 'Código verificado correctamente' });
        return;
      }else {
        console.log('Código incorrecto. Incrementando los intentos fallidos...');
        updatedUser = await prisma.usuario.update({
          where: { email: user?.email },
          data: {
            failedCodeAttempts: { increment: 1 },
          },
        });
        console.log(`Intentos fallidos: ${updatedUser.failedCodeAttempts}`);
        //res.status(400).json({ message: 'Código incorrecto. Por favor intenta nuevamente' });
        //Enviar al usuario al login

        if (updatedUser.failedCodeAttempts === 5) {
          const blockUntil = new Date(Date.now() + 15 * 60 * 1000); // Bloquear al usuario durante 15 minutos
          await prisma.usuario.update({
            where: { email: user?.email },
            data: {
              isBlocked: true,
              blockuntil: blockUntil,
              failedCodeAttempts: 0, // Reiniciamos los intentos fallidos
            },
          });
          console.log(`Usuario bloqueado hasta: ${blockUntil.toISOString()}`);
          res.status(400).json({ message: 'Código incorrecto. Usuario bloqueado temporalmente.' });
          return;
        }
        res.status(400).json({ message: 'Código incorrecto. Por favor intenta nuevamente' });
        return;
      }
    }   
      
  } catch (error) {
    console.error('❌ Error al verificar el código:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  } 
  
};