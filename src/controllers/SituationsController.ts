import express from 'express';
import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Situations } from '../entity/Situations.js';
import { PaginationService } from '../services/PaginationService.js';
import * as yup from 'yup';
import { Not } from 'typeorm';

const router = express.Router();

const situationSchema = yup.object().shape({
    nameSituation: yup.string()
        .trim()
        .required("O campo 'nameSituation' é obrigatório")
        .min(3, "O campo 'nameSituation' deve ter no mínimo 3 caracteres")
});

function parseId(value: string | string[] | undefined): number | null {
    const raw = Array.isArray(value) ? value[0] : value;
    const id = Number(raw);
    return raw && Number.isInteger(id) && id > 0 ? id : null;
}

router.get("/situations", async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(Situations);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await PaginationService.paginate(repo, page, limit, { id: "DESC" });
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar situações" });
    }
});

router.get("/situations/:id", async (req: Request, res: Response) => {
    try {
        const situationId = parseId(req.params.id);
        if (!situationId) {
            res.status(400).json({ message: "ID de situação inválido" });
            return;
        }
        const repo = AppDataSource.getRepository(Situations);
        const situation = await repo.findOneBy({ id: situationId });
        if (!situation) {
            res.status(404).json({ message: "Situação não encontrada" });
            return;
        }
        res.status(200).json(situation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar situação" });
    }
});

router.post("/situations", async (req: Request, res: Response) => {
    try {
        const data = await situationSchema.validate(req.body, { abortEarly: false });
        const repo = AppDataSource.getRepository(Situations);

        const existingSituation = await repo.findOne({
            where: { nameSituation: data.nameSituation }
        });
        if (existingSituation) {
            res.status(409).json({ message: "Já existe uma situação com esse nome" });
            return;
        }

        const newSituation = repo.create({ nameSituation: data.nameSituation });
        await repo.save(newSituation);
        res.status(201).json({
            message: "Situação criada com sucesso",
            situation: newSituation
        });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            res.status(400).json({ message: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao criar situação" });
    }
});

router.put("/situations/:id", async (req: Request, res: Response) => {
    try {
        const situationId = parseId(req.params.id);
        if (!situationId) {
            res.status(400).json({ message: "ID de situação inválido" });
            return;
        }

        const data = await situationSchema.validate(req.body, { abortEarly: false });
        const repo = AppDataSource.getRepository(Situations);

        const situation = await repo.findOneBy({ id: situationId });
        if (!situation) {
            res.status(404).json({ message: "Situação não encontrada" });
            return;
        }

        const existingSituation = await repo.findOne({
            where: {
                nameSituation: data.nameSituation,
                id: Not(situationId) // ignora a própria situação
            }
        });
        if (existingSituation) {
            res.status(409).json({ message: "Já existe uma situação com esse nome" });
            return;
        }

        repo.merge(situation, { nameSituation: data.nameSituation });
        const updatedSituation = await repo.save(situation);

        res.status(200).json({
            message: "Situação atualizada com sucesso",
            situation: updatedSituation
        });
    } catch (error: any) {
        if (error instanceof yup.ValidationError) {
            res.status(400).json({ message: error.errors });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar situação" });
    }
});
      

router.delete("/situations/:id", async (req: Request, res: Response) => {
    try {
        const situationId = parseId(req.params.id);
        if (!situationId) {
            res.status(400).json({ message: "ID de situação inválido" });
            return;
        }
        const repo = AppDataSource.getRepository(Situations);
        const situation = await repo.findOneBy({ id: situationId });
        if (!situation) {
            res.status(404).json({ message: "Situação não encontrada" });
            return;
        }
        await repo.delete(situationId);
        res.status(200).json({ message: "Situação removida com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao remover situação" });
    }
});

export default router;