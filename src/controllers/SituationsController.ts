import express from 'express';
import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Situations } from '../entity/Situations.js';


const router = express.Router();

router.get("/situations", async(req: Request, res:Response) => {
    try{
        const SituationRepository = AppDataSource.getRepository(Situations); 
        const page = Number(req.query.page) || 1;
        const limit = 1;
        const totalSituations = await SituationRepository.count();
        if (totalSituations === 0) {
            res.status(400).json({
                 message: "Nenhuma situação encontrada" });
        return;
    }
    const lastPage = Math.ceil(totalSituations / limit);
    if (page > lastPage) {
        res.status(400).json({   
            message: "Página inválida'.O total de páginas é " + lastPage });
        return;}

        const offset = (page - 1) * limit;

        const situations = await SituationRepository.find({
            skip: offset,
            take: limit,    
            order: {
                id: "DESC"
            }
        });

        res.status(200).json({
            currentPage: page,
            lastPage, 
            totalSituations,
            situations,
        });
      return;
      
    }catch (error) {
        res.status(500).json({ message: "Erro ao listar situações" });
        return;
    }
   

});
router.get("/situations/:id", async(req: Request, res:Response) => {
    try{const { id } = req.params;
        const idParam = Array.isArray(id) ? id[0] : id;
        const situationId = Number(idParam);
        if (!idParam || !Number.isInteger(situationId) || situationId <= 0) {
            res.status(400).json({ message: "ID de situação inválido" });
            return;
        }
         const SituationRepository = AppDataSource.getRepository(Situations); 
        const situations = await SituationRepository.findOneBy({ id: situationId });
        if (!situations) {
            res.status(404).json({ message: "Situação não encontrada" });
            return;
        }
        res.status(200).json(situations);
        return;
    }catch (error) {
        res.status(500).json({ message: "Erro ao buscar situação" });
        return;
    }
   

});


router.post("/situations", async(req: Request, res:Response) => {
    try{
        var data = req.body;
        const SituationRepository = AppDataSource.getRepository(Situations);
        const newSituation = SituationRepository.create(data);
        await SituationRepository.save(newSituation);
        res.status(201).json({
            message: "Situação criada com sucesso", 
            situation: newSituation
        });


    }catch (error) {
        res.status(500).json({ message: "Erro ao criar situação" });
    }
});


router.put("/situations/:id", async(req: Request, res:Response) => {
    try{
        const { id } = req.params;
        var data = req.body;
        const situationRepository = AppDataSource.getRepository(Situations);
        const situation = await situationRepository.findOneBy({ id: Number(id) });
        
        if (!situation) {
            res.status(404).json({ message: "Situação não encontrada" });
            return;
        }
        situationRepository.merge(situation, data);
        const updatedSituation = await situationRepository.save(situation);

        res.status(200).json({
            message: "Situação atualizada com sucesso",
            situation: updatedSituation
        });
    }catch (error) {
        res.status(500).json({ message: "Erro ao atualizar situação" });
        return;
    }
   

});
router.delete("/situations/:id", async(req: Request, res: Response) => {
    try {
        const { id } = req.params;

        console.log("DELETE recebido. ID =", id);

        const situationRepository = AppDataSource.getRepository(Situations);

        const situation = await situationRepository.findOneBy({
            id: Number(id)
        });

        console.log("Situação encontrada:", situation);

        if (!situation) {
            res.status(404).json({
                message: "Situação não encontrada"
            });
            return;
        }

        await situationRepository.delete(Number(id));

        res.status(200).json({
            message: "Situação removida com sucesso"
        });

    } catch (error) {
        console.error("ERRO COMPLETO:", error);

        res.status(500).json({
            message: "Erro ao remover situação"
        });
    }
});

export default router;
