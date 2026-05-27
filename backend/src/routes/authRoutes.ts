import { Router } from "express";
import { forgotPasswordStep3,forgotPasswordStep1,forgotPasswordStep2, login, refresh, register, verifySecurityQuestion, verifyPin } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/register", register); 
router.post("/refresh", refresh);
router.post("/verify-question", verifySecurityQuestion);

router.post("/forgot-password/step1", forgotPasswordStep1);
router.post("/forgot-password/step2", forgotPasswordStep2);
router.post("/forgot-password/step3", forgotPasswordStep3);
    
router.post("/verify-pin", verifyPin);
export default router;