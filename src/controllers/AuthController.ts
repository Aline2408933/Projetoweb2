import express,{ Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { AppDataSource } from '../data-source.js';
import { Users } from '../entity/Users.js';
import * as yup from 'yup';
import crypto from "crypto";
import nodemailer from 'nodemailer';
import { verifyToken } from '../middlewares/authMiddleware.js';

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


     router.get("/validate-token", verifyToken, async (req: Request, res: Response) => {
    try {
        res.status(200).json({
            message: "Token válido!",
            userId: (req as any).user.id,
        });
        return;
    } catch (error) {
        res.status(500).json({
            message: "Erro ao validar token",
        });
    }
});





router.post("/recover-password", async (req: Request, res: Response) => {
    try{
        var data = req.body;

        const schema = yup.object().shape({
            urlRecoverPassword: yup.string().required("O campo URL é obrigatório"),
            email: yup.string().email("Email inválido").required("O campo e-mail é obrigatório")
        });

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
                    message: `E-mail não enviado, tente novamente ou contate ${process.env.EMAIL_ADM}`,
                });
                return;
            }else{
                res.status(200).json({
                    message: "Email enviado! Verifique sua caixa de entrada!",
                    urlRecoverPassword: `${data.urlRecoverPassword}?email=${data.email}&key=${users.recoverPassword}`,
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
            message: "Erro ao recuperar senha do usuário!",
        });
    }
});

router.post("/validate-recover-password", async (req: Request, res: Response) => {
    try {
        var data = req.body;

        const schema = yup.object().shape({
            recoverPassword: yup.string().required("A Chave é obrigatória!"),
            email: yup.string().email("E-mail inválido!").required("O campo e-mail é obrigatório"),
        });

        await schema.validate(data, { abortEarly: false });

        const userRepository = AppDataSource.getRepository(Users);

        const user = await userRepository.findOneBy({ email: data.email, recoverPassword: data.recoverPassword });

        if (!user) {
            res.status(400).json({
                message: "A chave para recuperar senha é inválida",
            });
            return;
        }

        res.status(200).json({
            message: "A chave de recuperar senha é válida",
        });
        return;

    } catch (error: any) {
        if (error instanceof yup.ValidationError) {
            res.status(400).json({
                message: error.errors,
            });
            return;
        }
        res.status(500).json({
            message: "A chave recuperar senha é inválida",
        });
    }
});

router.put("/update-password", async (req: Request, res: Response) => {
    try {
        var data = req.body;

        const schema = yup.object().shape({
            recoverPassword: yup.string().required("A Chave é obrigatória!"),
            email: yup.string().email("E-mail inválido!").required("O campo e-mail é obrigatório"),
            password: yup.string().required("O campo senha é obrigatório").min(6, "O campo senha deve ter no mínimo 6 caracteres!"),
        });

        await schema.validate(data, { abortEarly: false });

        const userRepository = AppDataSource.getRepository(Users);

        const user = await userRepository.findOneBy({ email: data.email, recoverPassword: data.recoverPassword });

        if (!user) {
            res.status(400).json({
                message: "A chave para recuperar senha é inválida",
            });
            return;
        }

        user.password = data.password;
        user.recoverPassword = null as any;

        await userRepository.save(user);

        res.status(200).json({
            message: "Senha atualizada com sucesso!"
        });
        return;

    } catch (error: any) {
        if (error instanceof yup.ValidationError) {
            res.status(400).json({
                message: error.errors,
            });
            return;
        }
        res.status(500).json({
            message: "A chave recuperar senha é inválida",
        });
    }
});

router.post("/new-users", async (req: Request, res: Response) => {
    try {
        var data = req.body;

        const schema = yup.object().shape({
            nameUsers: yup.string().required("O campo 'nameUsers' é obrigatório").min(3, "O campo 'nameUsers' deve ter no mínimo 3 caracteres"),
            email: yup.string().email("E-mail inválido").required("O campo 'email' é obrigatório"),
            password: yup.string().required("O campo 'password' é obrigatório").min(6, "O campo 'password' deve ter no mínimo 6 caracteres"),
            situation: yup.number().required("O campo 'situation' é obrigatório"),
        });

        await schema.validate(data, { abortEarly: false });

        const userRepository = AppDataSource.getRepository(Users);

        const existingUser = await userRepository.findOne({
            where: { email: data.email },
        });

        if (existingUser) {
            res.status(400).json({
                message: "Já existe um usuário cadastrado com esse e-mail!",
            });
            return;
        }

        // Salvar o registro no banco de dados
        const newUser = await userRepository.save(userRepository.create(data));

        // Retornar resposta de sucesso
        res.status(201).json({
            message: "Usuário cadastrado com sucesso!",
            user: newUser,
        });
        return;

    } catch (error) {
        if (error instanceof yup.ValidationError) {
            // Retornar erros de validação
            res.status(400).json({
                message: error.errors,
            });
            return;
        }
        res.status(500).json({
            message: "Erro ao cadastrar usuário!",
        });
    }
});

export default router;