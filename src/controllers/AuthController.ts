import express from 'express';
import type { Request, Response } from 'express';


const router = express.Router();

router.get("/", (req: Request, res:Response) => {
    res.send("Seja Bem-Vindo");
});

export default router;
