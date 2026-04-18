import {Router} from "express";
import {getAllClients,getClient,addClient,updateClient,deleteClient} from "../controllers/clientController";

const router=Router();

router.get("/",getAllClients);
router.get("/:id",getClient);
router.post("/",addClient);
router.put("/:id",updateClient);
router.delete("/:id",deleteClient);

export default router;