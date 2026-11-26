import express,{ Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { AppDataSource } from '../data-source.js';
import { Users } from '../entity/Users.js';
import * as yup from 'yup';
import crypto from "crypto";
import { runInNewContext } from 'vm';

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

router.post("/recover-password", async (req: Request, res: Response) => {
    try{
        var data = req.body;

     const schema = yup.object().shape({
    urlRecoverPassword: yup.string().required("O campo URL é obrigatório"),
    email: yup.string().email("Email inválido").required("O campo e-mail é obrigatório")});

        await schema.validate(data, {abortEarly: false});
        const userRepository = AppDataSource.getRepository(Users);

        const users = await userRepository.findOneBy( {email: data.email});

        if (!users){
            res.status(404).json({
                message: "Usuário não encontrado"
            });
            return;
        }

      users.recoverPassword = crypto.randomBytes(32).toString("hex");

      await userRepository.save(users);
     res.status(200).json({
    message: "Gerado o link para recuperar a senha!",
    urlRecoverPassword: `${data.urlRecoverPassword}?email=${data.email}&key=${users.recoverPassword}`,
    key: users.recoverPassword,
});




    }catch(error: any){

        if(error instanceof yup.ValidationError){
            res.status(400).json({
                message: error.errors
            });
            return;
        }
        res.status(500).json({
            message: "Erro ao editar senha do usuário",

        });
    }
       
});



export default router;
