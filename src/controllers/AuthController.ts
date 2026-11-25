import express from 'express';
import type { Request, Response } from 'express';
import { Users } from '../entity/Users.js';
import { AuthService } from '../services/AuthService.js';


const router = express.Router();

router.post("/", async (req: Request, res:Response) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            res.status(400).json({ message: "E-mail e senha são obrigatórios" 
            });
            return;
        }

        const authService = new AuthService();
        const userData = await authService.login(email, password);


         res.status(200).json({ 
            message: "Login realizado com sucesso",
            user: userData
         });

         return;

    } catch (error: any) {
    res.status(401).json({
        message: error.message || "Erro ao realizar login"
    });
    return;
}
});

export default router;
