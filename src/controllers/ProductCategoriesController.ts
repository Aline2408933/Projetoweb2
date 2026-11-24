import express from "express";
import type { Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { ProductCategories } from "../entity/ProductCategories.js";
import { PaginationService } from "../services/PaginationService.js";
import * as yup from "yup";
import { Not } from "typeorm";

const router = express.Router();

const categorySchema = yup.object().shape({
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

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erro ao listar categorias"
        });
    }
});

router.get("/product-categories/:id", async (req: Request, res: Response) => {
    try {

        const categoryId = parseId(req.params.id);

        if (!categoryId) {
            res.status(400).json({
                message: "ID de categoria inválido"
            });
            return;
        }

        const repository = AppDataSource.getRepository(ProductCategories);

        const category = await repository.findOneBy({
            id: categoryId
        });

        if (!category) {
            res.status(404).json({
                message: "Categoria não encontrada"
            });
            return;
        }

        res.status(200).json(category);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erro ao buscar categoria"
        });
    }
});

router.post("/product-categories", async (req: Request, res: Response) => {
    try {

        const data = await categorySchema.validate(req.body, {
            abortEarly: false
        });

        const repository = AppDataSource.getRepository(ProductCategories);

        const existingCategory = await repository.findOne({
            where: {
                name: data.name
            }
        });

        if (existingCategory) {
            res.status(409).json({
                message: "Já existe uma categoria com esse nome"
            });
            return;
        }

        const category = repository.create({
            name: data.name
        });

        await repository.save(category);

        res.status(201).json({
            message: "Categoria criada com sucesso",
            category
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
            message: "Erro ao criar categoria"
        });
    }
});

router.put("/product-categories/:id", async (req: Request, res: Response) => {
    try {

        const categoryId = parseId(req.params.id);

        if (!categoryId) {
            res.status(400).json({
                message: "ID de categoria inválido"
            });
            return;
        }

        const data = await categorySchema.validate(req.body, {
            abortEarly: false
        });

        const repository = AppDataSource.getRepository(ProductCategories);

        const category = await repository.findOneBy({
            id: categoryId
        });

        if (!category) {
            res.status(404).json({
                message: "Categoria não encontrada"
            });
            return;
        }

        const existingCategory = await repository.findOne({
            where: {
                name: data.name,
                id: Not(categoryId)
            }
        });

        if (existingCategory) {
            res.status(409).json({
                message: "Já existe uma categoria com esse nome"
            });
            return;
        }

        repository.merge(category, {
            name: data.name
        });

        const updatedCategory = await repository.save(category);

        res.status(200).json({
            message: "Categoria atualizada com sucesso",
            category: updatedCategory
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
            message: "Erro ao atualizar categoria"
        });
    }
});

router.delete("/product-categories/:id", async (req: Request, res: Response) => {
    try {

        const categoryId = parseId(req.params.id);

        if (!categoryId) {
            res.status(400).json({
                message: "ID de categoria inválido"
            });
            return;
        }

        const repository = AppDataSource.getRepository(ProductCategories);

        const category = await repository.findOneBy({
            id: categoryId
        });

        if (!category) {
            res.status(404).json({
                message: "Categoria não encontrada"
            });
            return;
        }

        await repository.delete(categoryId);

        res.status(200).json({
            message: "Categoria removida com sucesso"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erro ao remover categoria"
        });
    }
});

export default router;