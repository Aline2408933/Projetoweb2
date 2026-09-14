import express from 'express';

import dotenv from 'dotenv';
dotenv.config();


const app = express();

app.use(express.json());

import AuthController from"./controllers/AuthController.js";
import SituationsController from "./controllers/SituationsController.js";


app.use('/', AuthController );
app.use('/', SituationsController );



app.listen(process.env.PORT, ()=>{
    console.log(`Servidor rodando na porta ${process.env.PORT}: http://localhost:${process.env.PORT}`)
});