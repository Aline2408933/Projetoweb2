import express from "express";
import type { Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { Products } from "../entity/Products.js";
import { PaginationService } from "../services/PaginationService.js";

const router = express.Router();

router.get("/products", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(Products);

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
            message: "Erro ao listar produtos"
        });
        return;
    }
});

router.get("/products/:id", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(Products);

        const product = await repository.findOneBy({
            id: Number(req.params.id)
        });

        if (!product) {
            res.status(404).json({
                message: "Produto não encontrado"
            });
            return;
        }

        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({
            message: "Erro ao buscar produto"
        });
    }
});

router.post("/products", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(Products);

        const product = repository.create(req.body);

        await repository.save(product);

        res.status(201).json({
            message: "Produto criado com sucesso",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao criar produto"
        });
    }
});

router.put("/products/:id", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(Products);

        const product = await repository.findOneBy({
            id: Number(req.params.id)
        });

        if (!product) {
            res.status(404).json({
                message: "Produto não encontrado"
            });
            return;
        }

        repository.merge(product, req.body);

        const updatedProduct = await repository.save(product);

        res.status(200).json({
            message: "Produto atualizado com sucesso",
            product: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao atualizar produto"
        });
    }
});

router.delete("/products/:id", async (req: Request, res: Response) => {
    try {

        const repository = AppDataSource.getRepository(Products);

        const product = await repository.findOneBy({
            id: Number(req.params.id)
        });

        if (!product) {
            res.status(404).json({
                message: "Produto não encontrado"
            });
            return;
        }

        await repository.delete(Number(req.params.id));

        res.status(200).json({
            message: "Produto removido com sucesso"
        });

    } catch (error) {
        res.status(500).json({
            message: "Erro ao remover produto"
        });
    }
});

export default router;