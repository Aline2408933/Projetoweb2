import {DataSource} from "typeorm";
import { Products } from "../entity/Products.js";
import { ProductCategories } from "../entity/ProductCategories.js";
import { ProductSituations } from "../entity/ProductSituations.js";

export default class CreateProductsSeed {
    public static async run(dataSource: DataSource): Promise<void> {
        console.log("Iniciando o seed para a tabela 'Products'...");

        const productRepository = dataSource.getRepository(Products);
        const categoryRepository = dataSource.getRepository(ProductCategories);
        const situationRepository = dataSource.getRepository(ProductSituations);

        const existingCount = await productRepository.count();
        if (existingCount > 0) {
            console.log("O seed para a tabela 'Products' já possui dados. Nenhuma alteração foi realizada.");
            return;
        }

        const situations = await situationRepository.findOne({ where: { id: 1 } });
        if (!situations) {
            console.error("Erro: Situação com ID 1 não encontrada. Verifique se o seed para a tabela 'ProductSituations' está populada.");
            return;
        }

        const categories = await categoryRepository.findOne({ where: { id: 1 } });
        if (!categories) {
            console.error("Erro: Categoria com ID 1 não encontrada. Verifique se o seed para a tabela 'ProductCategories' está populada.");
            return;
        }

        const products = [
            Object.assign(new Products(), {
                id: 1,
                name:"Curso de Node.js",
                slug: "curso-de-nodejs",
                description: "No curso de Node.js, é abordado o desenvolvimento...",
                price: 447.87,
                situations: situations,
                categories: categories,
            }),
            Object.assign(new Products(), {
                id: 2,
                name:"Curso de React",
                slug: "curso-de-react",
                description: "No curso de React, é abordado o desenvolvimento...",
                price: 447.87,
                situations: situations,
                categories: categories, 
            }),
            Object.assign(new Products(), {
                id: 3,
                name:"Curso de Node.js e React",
                slug: "curso-de-nodejs-e-react",
                description: "No curso de Node.js e React, é abordado o desenvolvimento...",
                price: 447.87,
                situations: situations,
                categories: categories,
            }),
        ];
        await productRepository.save(products);
        console.log("Seed concluído com sucesso: produtos cadastrados!");
    }
}

