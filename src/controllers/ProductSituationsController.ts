import express from "express";
import type { Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { ProductSituations } from "../entity/ProductSituations.js";
import { PaginationService } from "../services/PaginationService.js";

const router = express.Router();

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
        return;

    } catch (error) {
        res.status(500).json({
            message: "Erro ao listar situações de produto"
        });
        return;
    }
});

router.get("/product-situations/:id", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(ProductSituations);

        const productSituation = await repository.findOneBy({
            id: Number(req.params.id)
        });

        if (!productSituation) {
            res.status(404).json({
                message: "Situação de produto não encontrada"
            });
            return;
        }

        res.status(200).json(productSituation);

    } catch (error) {
        res.status(500).json({
            message: "Erro ao buscar situação de produto"
        });
    }
});

router.post("/product-situations", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(ProductSituations);

        const productSituation = repository.create(req.body);

        await repository.save(productSituation);

        res.status(201).json({
            message: "Situação de produto criada com sucesso",
            productSituation
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao criar situação de produto"
        });
    }
});

router.put("/product-situations/:id", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(ProductSituations);

        const productSituation = await repository.findOneBy({
            id: Number(req.params.id)
        });

        if (!productSituation) {
            res.status(404).json({
                message: "Situação de produto não encontrada"
            });
            return;
        }

        repository.merge(productSituation, req.body);

        const updatedProductSituation = await repository.save(productSituation);

        res.status(200).json({
            message: "Situação de produto atualizada com sucesso",
            productSituation: updatedProductSituation
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao atualizar situação de produto"
        });
    }
});

router.delete("/product-situations/:id", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(ProductSituations);

        const productSituation = await repository.findOneBy({
            id: Number(req.params.id)
        });

        if (!productSituation) {
            res.status(404).json({
                message: "Situação de produto não encontrada"
            });
            return;
        }

        await repository.delete(Number(req.params.id));

        res.status(200).json({
            message: "Situação de produto removida com sucesso"
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao remover situação de produto"
        });
    }
});

export default router;