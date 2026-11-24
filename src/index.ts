import express from 'express';

import dotenv from 'dotenv';

import cors from 'cors';

dotenv.config();


const app = express();

app.use(express.json());

app.use(cors());
import TestConnectionController from"./controllers/TestConnectionController.js";
import AuthController from"./controllers/AuthController.js";
import UsersController from"./controllers/UsersController.js";
import SituationsController from "./controllers/SituationsController.js";
import ProductCategoriesController from "./controllers/ProductCategoriesController.js";
import ProductSituationsController from "./controllers/ProductSituationsController.js";     
import ProductsController from "./controllers/ProductsController.js";




app.use('/', TestConnectionController);
app.use('/', AuthController );
app.use('/', UsersController );
app.use('/', SituationsController );
app.use('/', ProductCategoriesController );
app.use('/', ProductSituationsController );
app.use('/', ProductsController );
app.use('/', UsersController );

app.listen(process.env.PORT, ()=>{
    console.log(`Servidor rodando na porta ${process.env.PORT}: http://localhost:${process.env.PORT}`)
});