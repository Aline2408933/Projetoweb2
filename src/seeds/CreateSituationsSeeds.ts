import {DataSource} from "typeorm";
import {Situations} from "../entity/Situations.js";

export default class CreateSituationsSeeds {
public async run(dataSource: DataSource): Promise<void> {
    console.log("Iniciando a criação de seeds para situações...");
    const situationRepository = dataSource.getRepository(Situations);
    const existingCount = await situationRepository.count();
    if (existingCount > 0) {
        console.log("Seeds de situações já foram criadas. Nenhuma alteração foi realizada.");
        return;
    }

    const SituationsData = [
        { nameSituation: "Ativo" },
        { nameSituation: "Inativo" },
        { nameSituation: "Pendente" }
    ];
    await situationRepository.save(SituationsData);
    console.log("Seeds de situações criadas com sucesso!");


  }
}

    