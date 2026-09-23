import express from 'express';

import dotenv from 'dotenv';
dotenv.config();


const app = express();

app.use(express.json());

import AuthController from"./controllers/AuthController.js";
import SituationsController from "./controllers/SituationsController.js";
import ProductCategoriesController from "./controllers/ProductCategoriesController.js";
import ProductSituationsController from "./controllers/ProductSituationsController.js";     
import ProductsController from "./controllers/ProductsController.js";




app.use('/', AuthController );
app.use('/', SituationsController );
app.use('/', ProductCategoriesController );
app.use('/', ProductSituationsController );
app.use('/', ProductsController );


app.listen(process.env.PORT, ()=>{
    console.log(`Servidor rodando na porta ${process.env.PORT}: http://localhost:${process.env.PORT}`)
});