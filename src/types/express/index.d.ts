// types/express/index.d.ts
import { Usuario } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends Usuario {}

    interface Request {
      user?: User;
    }
  }
}
