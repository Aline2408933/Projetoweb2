import express from 'express';
import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Users } from '../entity/Users.js';
import { PaginationService } from '../services/PaginationService.js';
import * as yup from 'yup';
import { Not } from 'typeorm';

const router = express.Router();

const userSchema = yup.object().shape({
    nameUsers: yup.string()
        .trim()
        .required("O campo 'nameUsers' é obrigatório")
        .min(3, "O campo 'nameUsers' deve ter no mínimo 3 caracteres"),
    email: yup.string()
        .trim()
        .email("E-mail inválido")
        .required("O campo 'email' é obrigatório"),
    situation: yup.number()
        .required("O campo 'situation' é obrigatório"),
});

function parseId(value: string | string[] | undefined): number | null {
    const raw = Array.isArray(value) ? value[0] : value;
    const id = Number(raw);
    return raw && Number.isInteger(id) && id > 0 ? id : null;
}

router.get("/users", async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(Users);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await PaginationService.paginate(userRepository, page, limit, { id: "DESC" });
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar usuários" });
    }
});

router.get("/users/:id", async (req: Request, res: Response) => {
    try {
        const userId = parseId(req.params.id);
        if (!userId) {
            res.status(400).json({ message: "ID de usuário inválido" });
            return;
        }
        const userRepository = AppDataSource.getRepository(Users);
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao visualizar usuário" });
    }
});

router.post("/users", async (req: Request, res: Response) => {
    try {
        const data = await userSchema.validate(req.body, { abortEarly: false });
        const userRepository = AppDataSource.getRepository(Users);

        const existingUser = await userRepository.findOne({
            where: { email: data.email },
        });
        if (existingUser) {
            res.status(409).json({ message: "E-mail já cadastrado" });
            return;
        }

        const newUser = userRepository.create({
            nameUsers: data.nameUsers,
            email: data.email,
            situation: { id: data.situation },
        });
        await userRepository.save(newUser);

        res.status(201).json({
            message: "Usuário criado com sucesso",
            user: newUser,
        });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            res.status(400).json({ message: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao criar usuário" });
    }
});

router.put("/users/:id", async (req: Request, res: Response) => {
    try {
        const userId = parseId(req.params.id);
        if (!userId) {
            res.status(400).json({ message: "ID de usuário inválido" });
            return;
        }

        const data = await userSchema.validate(req.body, { abortEarly: false });
        const userRepository = AppDataSource.getRepository(Users);

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }

        const existingUser = await userRepository.findOne({
            where: { email: data.email, id: Not(userId) },
        });
        if (existingUser) {
            res.status(409).json({ message: "Já existe um usuário com esse e-mail" });
            return;
        }

        userRepository.merge(user, {
            nameUsers: data.nameUsers,
            email: data.email,
            situation: { id: data.situation },
        });
        const updatedUser = await userRepository.save(user);

        res.status(200).json({
            message: "Usuário atualizado com sucesso",
            user: updatedUser,
        });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            res.status(400).json({ message: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao editar usuário" });
    }
});

router.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);

        const userRepository = AppDataSource.getRepository(Users);

        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            return res.status(404).json({
                error: true,
                message: "Usuário não encontrado"
            });
        }

        await userRepository.remove(user);

        return res.status(200).json({
            error: false,
            message: "Usuário excluído com sucesso"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: true,
            message: "Erro ao excluir usuário"
        });
    }
});

export default router;