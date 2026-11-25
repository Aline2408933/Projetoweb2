import {DataSource} from "typeorm";
import {Users} from "../entity/Users.js";
import {Situations} from "../entity/Situations.js";
import bcrypt from "bcryptjs";

export default class CreateUsersSeed {
public async run(dataSource: DataSource): Promise<void> {
console.log("Iniciando o seed para a tabela 'Users'...");

const userRepository = dataSource.getRepository(Users);
const situationsRepository = dataSource.getRepository(Situations);

const existingCount = await userRepository.count();
if (existingCount > 0) {
console.log("O seed para a tabela 'Users' já possui dados. Nenhuma alteração foi realizada.");
return;
}

const situations = await situationsRepository.findOne({where: { id: 1 }});

if (!situations) {
console.error("Erro: Situação com ID 1 não encontrada. Verifique se o seed para a tabela 'Situations' está populada.");
return;
}
 
const users= [
    {id:1,
     nameUsers: "Aline da Silva",
     email: "aline.silva@example.com",
     password: await bcrypt.hash("123456", 10),
     situation: situations,
    },
    {id:2,
     nameUsers: "Kaique Rodrigues",
     email: "kaique.rodrigues@example.com",
     password: await bcrypt.hash("123456", 10),
     situation: situations,
    }
];
    await userRepository.save(users);
    console.log("Seed concluido com sucesso: usuarios cadastrados!");

  }
}