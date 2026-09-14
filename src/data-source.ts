import "dotenv/config";
import "reflect-metadata"
import { DataSource } from "typeorm"
import { Users } from "./entity/Users.js";
import { Situations } from "./entity/Situations.js";

import dotenv from 'dotenv';
dotenv.config();


const dialect = process.env.DB_DIALECT ?? "mysql";

export const AppDataSource = new DataSource({
    type: process.env.DB_DIALECT as any,
    host: process.env.DB_HOST!,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
    synchronize: false,
    logging: true,
   entities: [Situations, Users],
    migrations: ["dist/migration/*.js"],
    subscribers: [],
})
AppDataSource.initialize().then(() =>{
console.log("Conexão com o banco de dados realizada com sucesso!");
} ).catch((error) => {
console.log("Erro ao conectar com o banco de dados: ", error);
})