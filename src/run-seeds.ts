import { AppDataSource } from "./data-source.js";
import CreateSituationsSeeds from "./seeds/CreateSituationsSeeds.js";

const runSeeds = async () => {
    console.log("Iniciando a execução das seeds...");
    await AppDataSource.initialize()
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
        try {
            const situationSeeds = new CreateSituationsSeeds();
            await situationSeeds.run(AppDataSource);

        }catch (error) {
        console.error("Erro ao executar as seeds:", error);
    }finally {
        await AppDataSource.destroy();
        console.log("Conexão com o banco de dados encerrada.");
    }

};  
runSeeds();