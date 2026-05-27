import {Request,Response} from "express";
import {clientService} from "../service/clientServiceInstance";
import { validateWorkout } from "../validators/workoutValidators";
import { validateId } from "../validators/idValidators";



export const getWorkouts=async (req: Request,res: Response)=>{
    const idError=validateId(req.params.clientId);
    if(idError){
        return res.status(400).json({message:idError});
    }
    const clientId=Number(req.params.clientId);
    
    const {page="1",limit="5"} = req.query;

    const pageNumber=Number(page);
    const limitNumber=Number(limit);
    if(isNaN(pageNumber) || pageNumber<=0){
        return res.status(400).json({message:"Page must be a positive number"});
    }

    if(isNaN(limitNumber) || limitNumber<=0){
        return res.status(400).json({message:"Limit must be a positive number"});
    }

    const workouts=await clientService.getWorkouts(clientId);
    if(workouts===null || workouts===undefined){
        return res.status(404).json({message:"Client not found"});
    }

    const start=(pageNumber-1)*limitNumber;
    const end=start+limitNumber;

    const paginatedWorkouts=workouts.slice(start,end);

    return res.json({
        data: paginatedWorkouts,
        total: workouts.length,
        page: pageNumber,
        totalPages: Math.ceil(workouts.length/limitNumber)
    });
};

export const addWorkout=async (req: Request,res: Response)=>{
    const idError=validateId(req.params.clientId);
    if(idError){
        return res.status(400).json({message:idError});
    }
    const clientId=Number(req.params.clientId);

    const workout=req.body;
    const workoutError=validateWorkout(workout);
    if(workoutError){
        return res.status(400).json({message:workoutError});
    }

    const added=await clientService.addWorkout(clientId, workout);
    if(!added){
        return res.status(404).json({message:"Client not found"});
    }
    return res.status(201).json(added);
};

export const deleteWorkout=async (req: Request,res: Response)=>{
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

    const deleted=await clientService.deleteWorkout(clientId, workoutId);
    if(!deleted){
        return res.status(404).json({message:"Client or workout not found"});
    }
    return res.status(200).json(deleted);
};
