import express,{ Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { AppDataSource } from '../data-source.js';
import { Users } from '../entity/Users.js';
import * as yup from 'yup';
import crypto from "crypto";
import nodemailer from 'nodemailer';
import { Subject } from 'typeorm/persistence/Subject.js';
import { text } from 'stream/consumers';

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
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
       port: Number(process.env.EMAIL_PORT),
       secure: false,
        auth: {
         user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
  }
});

var message_content = {
    from: process.env.EMAIL_FROM,
    to: data.email,
    subject: "Recuperar Senha",
    text: `Prezado(a) ${users.nameUsers}
    Informamos que a sua solicitação de alteração de senha foi recebida com sucesso.
Clique ou copie o link para criar uma nova senha em nosso sistema:
${data.urlRecoverPassword}?email=${data.email}&key=${users.recoverPassword}
Esta mensagem foi enviada a você pela empresa ${process.env.APP}.
Você está recebendo porque está cadastrado no banco de dados da empresa ${process.env.APP}.
Nenhum e-mail enviado pela empresa ${process.env.APP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.`,


        html: ` Prezado(a) ${users.nameUsers}<br><br>
        Informamos que a sua solicitação de alteração de senha foi recebida com sucesso.<br><br>
        Clique no link para criar uma nova senha em nosso sistema:<br><br>
        <a href="${data.urlRecoverPassword}?email=${data.email}&key=${users.recoverPassword}">
         ${data.urlRecoverPassword}?email=${data.email}&key=${users.recoverPassword}
        </a>
        <br><br>
        Esta mensagem foi enviada a você pela empresa ${process.env.APP}.<br><br>
        Você está recebendo porque está cadastrado no banco de dados da empresa ${process.env.APP}.<br><br>
        Nenhum e-mail enviado pela empresa ${process.env.APP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais. `
};
 transporter.sendMail(message_content, function(err){
    if(err){
        console.log("Erro ao enviar email:", err);
        res.status(200).json({
            message:`E-mail não enviado, tente novamente ou contate ${process.env.EMAIL_ADM}`,
        });
        return
    }else{
        res.status(200).json({
            message:"Email enviado! Verifique sua caixa de entrada!",
            urlRecoverPassword:`${data.urlRecoverPassword}?email=${data.email}&key=${users.recoverPassword}`,
        });
        return;
    }
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