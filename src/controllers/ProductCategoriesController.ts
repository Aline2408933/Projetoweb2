import express from "express";
import type { Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { ProductCategories } from "../entity/ProductCategories.js";
import { PaginationService } from "../services/PaginationService.js";

const router = express.Router();

router.get("/product-categories", async (req: Request, res: Response) => {
    try {
        const repository = AppDataSource.getRepository(ProductCategories);

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
            message: "Erro ao listar categorias"
        });
        return;
    }
});

router.get("/product-categories/:id", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(ProductCategories);

        const category = await repository.findOneBy({
            id: Number(req.params.id)
        });

        if (!category) {
            res.status(404).json({
                message: "Categoria não encontrada"
            });
            return;
        }

        res.status(200).json(category);

    } catch (error) {
        res.status(500).json({
            message: "Erro ao buscar categoria"
        });
    }
});

router.post("/product-categories", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(ProductCategories);

        const category = repository.create(req.body);

        await repository.save(category);

        res.status(201).json({
            message: "Categoria criada com sucesso",
            category
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao criar categoria"
        });
    }
});

router.put("/product-categories/:id", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(ProductCategories);

        const category = await repository.findOneBy({
            id: Number(req.params.id)
        });

        if (!category) {
            res.status(404).json({
                message: "Categoria não encontrada"
            });
            return;
        }

        repository.merge(category, req.body);

        const updatedCategory = await repository.save(category);

        res.status(200).json({
            message: "Categoria atualizada com sucesso",
            category: updatedCategory
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao atualizar categoria"
        });
    }
});

router.delete("/product-categories/:id", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(ProductCategories);

        const category = await repository.findOneBy({
            id: Number(req.params.id)
        });

        if (!category) {
            res.status(404).json({
                message: "Categoria não encontrada"
            });
            return;
        }

        await repository.delete(Number(req.params.id));

        res.status(200).json({
            message: "Categoria removida com sucesso"
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao remover categoria"
        });
    }
});

export default router;