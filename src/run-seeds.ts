import { AppDataSource } from "./data-source.js";

import CreateSituationsSeed from "./seeds/CreateSituationsSeeds.js";
import CreateUsersSeed from "./seeds/CreateUsersSeed.js";
import CreateProductCategoriesSeed from "./seeds/CreateProductCategoriesSeed.js";
import CreateProductSituationsSeed from "./seeds/CreateProductSituationsSeed.js";
import CreateProductsSeed from "./seeds/CreateProductsSeed.js";

const runSeeds = async () => {

    console.log("Iniciando a execução das seeds...");

    await AppDataSource.initialize();

    console.log("Conexão com o banco de dados estabelecida com sucesso.");

    try {

        const situationSeeds = new CreateSituationsSeed();
        const usersSeed = new CreateUsersSeed();

        await situationSeeds.run(AppDataSource);

        await CreateProductCategoriesSeed.run(AppDataSource);

        await CreateProductSituationsSeed.run(AppDataSource);

        await usersSeed.run(AppDataSource);

        await CreateProductsSeed.run(AppDataSource);

    } catch (error) {

        console.error(
            "Erro ao executar as seeds:",
            error
        );

    } finally {

        await AppDataSource.destroy();

        console.log(
            "Conexão com o banco de dados encerrada."
        );
    }
};

runSeeds();