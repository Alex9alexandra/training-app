import {Request,Response} from "express";
import {clientService} from "../service/clientServiceInstance";
import { validateClient } from "../validators/clientValidators";
import { validateId } from "../validators/idValidators";


export const getAllClients=async (req: Request,res: Response)=>{
    const {page="1", limit="5",search=""}=req.query;

    const pageNumber=Number(page);
    const limitNumber=Number(limit);

    if(isNaN(pageNumber) || pageNumber<=0){
        return res.status(400).json({message:"Page must be a positive number"});
    }

    if(isNaN(limitNumber) || limitNumber<=0){
        return res.status(400).json({message:"Limit must be a positive number"});
    }
    
    const clients=await clientService.getAllClients(String(search));

    const start=(pageNumber-1)*limitNumber;
    const end=start+limitNumber;

    const paginatedClients=clients.slice(start,end);

    return res.json({
        data: paginatedClients,
        total: clients.length,
        page: pageNumber,
        totalPages: Math.ceil(clients.length/limitNumber)
    });
};

export const getClient=async (req: Request,res: Response)=>{
    
    const idError=validateId(req.params.id);
    if(idError){
        return res.status(400).json({message:idError});
    }
    const id=Number(req.params.id);

    const client=await clientService.getClient(id);
    if(!client){
        return res.status(404).json({message:"Client not found"});
    }

    return res.json(client);
};

export const addClient=async (req:Request,res: Response)=>{
    const client=req.body;
    const clientError=validateClient(client);
    if(clientError){
        return res.status(400).json({message:clientError});
    }

    const added=await clientService.addClient(client);
    return res.status(201).json(added);
};

export const updateClient=async (req: Request,res:Response)=>{
    const idError=validateId(req.params.id);
    if(idError){
        return res.status(400).json({message:idError});
    }
    const id=Number(req.params.id);
    
    const client=req.body;
    const clientError=validateClient(client);
    if(clientError){
        return res.status(400).json({message:clientError});
    }
    
    const updated=await clientService.updateClient({...client,id});
    if(!updated){
        return res.status(404).json({message:"Client not found"});
    }
    return res.json(client);
};

export const deleteClient=async (req: Request,res: Response)=>{
    const idError=validateId(req.params.id);
    if(idError){
        return res.status(400).json({message:idError});
    }
    const id=Number(req.params.id);

    const deleted=await clientService.deleteClient(id);
    if(!deleted){
        return res.status(404).json({message:"Client not found"});
    }
    return res.status(200).json(deleted);
};
