import {Request,Response} from "express";
import {clientService} from "../service/clientServiceInstance";
import { validateExercise } from "../validators/exerciseValidators";
import {validateId} from "../validators/idValidators";



export const addExercise=async (req: Request,res: Response)=>{
    const {clientId,workoutId}=req.params;

    const idError1=validateId(clientId);
    if(idError1){
        return res.status(400).json({message:idError1});
    }

    const idError2=validateId(workoutId);
    if(idError2){
        return res.status(400).json({message:idError2});
    }

    const exerciseError=validateExercise(req.body);
    if(exerciseError){
        return res.status(400).json({message:exerciseError});
    }

    const added=await clientService.addExercise(Number(clientId), Number(workoutId), req.body);
    if(!added){
        return res.status(404).json({message:"Client or workout not found"});
    }
    return res.status(201).json(added);
};

export const deleteExercise=async (req: Request,res: Response)=>{
    const idError=validateId(req.params.clientId);
    if(idError){
        return res.status(400).json({message:idError});
    }
    const clientId=Number(req.params.clientId);

    const idError2=validateId(req.params.workoutId);
    if(idError2){
        return res.status(400).json({message:idError2});
    }
    const workoutId=Number(req.params.workoutId);

    const idError3=validateId(req.params.exerciseId);
    if(idError3){
        return res.status(400).json({message:idError3});
    }
    const exerciseId=Number(req.params.exerciseId);

    const deleted=await clientService.deleteExercise(clientId, workoutId, exerciseId);
    if(!deleted){
        return res.status(404).json({message:"Client, workout or exercise not found"});
    }
    return res.status(200).json(deleted);
};