import express from "express";
import type { Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { ProductSituations } from "../entity/ProductSituations.js";
import { PaginationService } from "../services/PaginationService.js";
import * as yup from "yup";
import { Not } from "typeorm";

const router = express.Router();

const productSituationSchema = yup.object().shape({
    name: yup.string()
        .trim()
        .required("O campo 'name' é obrigatório")
        .min(3, "O campo 'name' deve ter no mínimo 3 caracteres")
});

function parseId(value: string | string[] | undefined): number | null {
    const raw = Array.isArray(value) ? value[0] : value;
    const id = Number(raw);

    return raw && Number.isInteger(id) && id > 0
        ? id
        : null;
}

router.get("/product-situations", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(ProductSituations);

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const result = await PaginationService.paginate(
            repository,
            page,
            limit,
            { id: "DESC" }
        );

        res.status(200).json(result);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erro ao listar situações de produto"
        });
    }
});

router.get("/product-situations/:id", async (req: Request, res: Response) => {
    try {

        const productSituationId = parseId(req.params.id);

        if (!productSituationId) {
            res.status(400).json({
                message: "ID de situação de produto inválido"
            });
            return;
        }

        const repository = AppDataSource.getRepository(ProductSituations);

        const productSituation = await repository.findOneBy({
            id: productSituationId
        });

        if (!productSituation) {
            res.status(404).json({
                message: "Situação de produto não encontrada"
            });
            return;
        }

        res.status(200).json(productSituation);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erro ao buscar situação de produto"
        });
    }
});

router.post("/product-situations", async (req: Request, res: Response) => {
    try {

        const data = await productSituationSchema.validate(req.body, {
            abortEarly: false
        });

        const repository = AppDataSource.getRepository(ProductSituations);

        const existingProductSituation = await repository.findOne({
            where: {
                name: data.name
            }
        });

        if (existingProductSituation) {
            res.status(409).json({
                message: "Já existe uma situação de produto com esse nome"
            });
            return;
        }

        const productSituation = repository.create({
            name: data.name
        });

        await repository.save(productSituation);

        res.status(201).json({
            message: "Situação de produto criada com sucesso",
            productSituation
        });

    } catch (error) {

        if (error instanceof yup.ValidationError) {
            res.status(400).json({
                message: error.errors
            });
            return;
        }

        console.error(error);

        res.status(500).json({
            message: "Erro ao criar situação de produto"
        });
    }
});

router.put("/product-situations/:id", async (req: Request, res: Response) => {
    try {

        const productSituationId = parseId(req.params.id);

        if (!productSituationId) {
            res.status(400).json({
                message: "ID de situação de produto inválido"
            });
            return;
        }

        const data = await productSituationSchema.validate(req.body, {
            abortEarly: false
        });

        const repository = AppDataSource.getRepository(ProductSituations);

        const productSituation = await repository.findOneBy({
            id: productSituationId
        });

        if (!productSituation) {
            res.status(404).json({
                message: "Situação de produto não encontrada"
            });
            return;
        }

        const existingProductSituation = await repository.findOne({
            where: {
                name: data.name,
                id: Not(productSituationId)
            }
        });

        if (existingProductSituation) {
            res.status(409).json({
                message: "Já existe uma situação de produto com esse nome"
            });
            return;
        }

        repository.merge(productSituation, {
            name: data.name
        });

        const updatedProductSituation = await repository.save(productSituation);

        res.status(200).json({
            message: "Situação de produto atualizada com sucesso",
            productSituation: updatedProductSituation
        });

    } catch (error) {

        if (error instanceof yup.ValidationError) {
            res.status(400).json({
                message: error.errors
            });
            return;
        }

        console.error(error);

        res.status(500).json({
            message: "Erro ao atualizar situação de produto"
        });
    }
});

router.delete("/product-situations/:id", async (req: Request, res: Response) => {
    try {

        const productSituationId = parseId(req.params.id);

        if (!productSituationId) {
            res.status(400).json({
                message: "ID de situação de produto inválido"
            });
            return;
        }

        const repository = AppDataSource.getRepository(ProductSituations);

        const productSituation = await repository.findOneBy({
            id: productSituationId
        });

        if (!productSituation) {
            res.status(404).json({
                message: "Situação de produto não encontrada"
            });
            return;
        }

        await repository.delete(productSituationId);

        res.status(200).json({
            message: "Situação de produto removida com sucesso"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erro ao remover situação de produto"
        });
    }
});

export default router;