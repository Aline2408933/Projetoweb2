import { DataSource } from "typeorm";
import { ProductSituations } from "../entity/ProductSituations.js";

export default class CreateProductSituationsSeed {

    public static async run(dataSource: DataSource): Promise<void> {

        console.log(
            "Iniciando o seed para a tabela 'ProductSituations'..."
        );

        const situationRepository =
            dataSource.getRepository(ProductSituations);

        const existingCount =
            await situationRepository.count();

        if (existingCount > 0) {

            console.log(
                "O seed para a tabela 'ProductSituations' já possui dados."
            );

            return;
        }

        const situations = [
            {
                id: 1,
                name: "Ativo"
            },
            {
                id: 2,
                name: "Inativo"
            }
        ];

        await situationRepository.save(situations);

        console.log(
            "Seed concluído com sucesso: situações cadastradas!"
        );
    }
}