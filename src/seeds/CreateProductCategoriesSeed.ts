import { DataSource } from "typeorm";
import { ProductCategories } from "../entity/ProductCategories.js";

export default class CreateProductCategoriesSeed {

    public static async run(dataSource: DataSource): Promise<void> {

        console.log(
            "Iniciando o seed para a tabela 'ProductCategories'..."
        );

        const categoryRepository =
            dataSource.getRepository(ProductCategories);

        const existingCount =
            await categoryRepository.count();

        if (existingCount > 0) {

            console.log(
                "O seed para a tabela 'ProductCategories' já possui dados."
            );

            return;
        }

        const categories = [
            {
                id: 1,
                name: "Cursos"
            },
            {
                id: 2,
                name: "Livros"
            },
            {
                id: 3,
                name: "E-books"
            }
        ];

        await categoryRepository.save(categories);

        console.log(
            "Seed concluído com sucesso: categorias cadastradas!"
        );
    }
}