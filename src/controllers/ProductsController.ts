import express from "express";
import type { Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { Products } from "../entity/Products.js";
import { PaginationService } from "../services/PaginationService.js";
import * as yup from "yup";
import slugify from "slugify";
import { Not } from "typeorm";

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

        var data = req.body;

        const schema = yup.object().shape({
            name: yup.string()
                .required("O campo nome é obrigatório!")
                .min(3, "O campo nome deve ter no mínimo 3 caracteres!")
                .max(255, "O campo nome deve ter no máximo 255 caracteres!"),

            slug: yup.string()
                .required("O campo slug é obrigatório!")
                .min(3, "O campo slug deve ter no mínimo 3 caracteres!")
                .max(255, "O campo slug deve ter no máximo 255 caracteres!"),

            description: yup
                .string()
                .required("O campo descrição é obrigatório!")
                .min(10, "A descrição deve ter pelo menos 10 caracteres!"),

            price: yup
            .number()
                .typeError("O preço deve ser um número!")
                .required("O campo preço é obrigatório!")
                .positive("O preço deve ser um número positivo!")
                .test("is decimal", "O preço deve ter no máximo duas casas decimais!",
                     (value) => /^\d+(\.\d{1,2})?$/.test(value?.toString() || "")
                    ),

            Situations: yup
            .number()
            .typeError("O campo situação deve ser um número!")
            .required("O campo situação é obrigatório!")
            .integer("O campo situação deve ser um número inteiro!")
            .positive("O campo situação deve ser um número positivo!"),

            Categories: yup
            .number()
            .typeError("O campo categoria deve ser um número!")
            .required("O campo categoria é obrigatório!")
            .integer("O campo categoria deve ser um número inteiro!")
            .positive("O campo categoria deve ser um número positivo!")
        });

        await schema.validate(data, { abortEarly: false});

        data.slug = slugify(data.slug, { lower: true, strict: true });

        const productRepository = AppDataSource.getRepository(Products);
        const existingProduct = await productRepository.findOne({ where: { slug: data.slug } });

        
        if (existingProduct) {
            res.status(400).json({
                message: "Já existe um produto com esse slug!"
            });
            return;
        }
        const newProduct = productRepository.create(data);
        await productRepository.save(newProduct);

        res.status(201).json({
            message: "Produto criado com sucesso!",
            product: newProduct
        });

    } catch (error) {
        if (error instanceof yup.ValidationError) {
            res.status(400).json({
                message: error.errors
            });
            return;
        }
        res.status(500).json({
            message: "Erro ao criar produto"
        });
    }

});

router.put("/products/:id", async (req: Request, res: Response) => {
    try {

        const id = Number(req.params.id);
        const data = req.body;

        const schema = yup.object().shape({
            name: yup.string()
                .required("O campo nome é obrigatório!")
                .min(3, "O campo nome deve ter no mínimo 3 caracteres!")
                .max(255, "O campo nome deve ter no máximo 255 caracteres!"),

            slug: yup.string()
                .required("O campo slug é obrigatório!")
                .min(3, "O campo slug deve ter no mínimo 3 caracteres!")
                .max(255, "O campo slug deve ter no máximo 255 caracteres!"),

            description: yup.string()
                .required("O campo descrição é obrigatório!")
                .min(10, "A descrição deve ter pelo menos 10 caracteres!"),

            price: yup.number()
                .required("O campo preço é obrigatório!")
                .positive("O campo preço deve ser um número positivo!")
                .test(
                    "is-decimal",
                    "O preço deve ter no máximo duas casas decimais!",
                    (value: number | undefined) =>
                        /^\d+(\.\d{1,2})?$/.test(value?.toString() || "")
                ),

            situation: yup.number()
                .required("O campo situação é obrigatório!")
                .integer("O campo situação deve ser um número inteiro!")
                .positive("O campo situação deve ser um número positivo!"),

            category: yup.number()
                .required("O campo categoria é obrigatório!")
                .integer("O campo categoria deve ser um número inteiro!")
                .positive("O campo categoria deve ser um número positivo!")
        });

        await schema.validate(data, { abortEarly: false });

        const productRepository =
            AppDataSource.getRepository(Products);

        const product = await productRepository.findOneBy({
            id: id
        });

        if (!product) {
            res.status(404).json({
                message: "Produto não encontrado"
            });
            return;
        }

        data.slug = slugify(String(data.slug), {
            lower: true,
            strict: true
        });

        const existingProduct =
            await productRepository.findOne({
                where: {
                    slug: data.slug,
                    id: Not(id)
                }
            });

        if (existingProduct) {
            res.status(400).json({
                message: "Já existe um produto com esse slug!"
            });
            return;
        }

        productRepository.merge(product, data);

        const updatedProduct =
            await productRepository.save(product);

        res.status(200).json({
            message: "Produto atualizado com sucesso",
            product: updatedProduct
        });

    } catch (error) {

        if (error instanceof yup.ValidationError) {
            res.status(400).json({
                message: error.errors
            });
            return;
        }

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