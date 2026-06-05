import { Request, Response } from "express";
import * as authService from "../services/authService";
import { generateToken } from "../middleware/auth";
import { ServiceError } from "../lib/errors";

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, phonenumber } = req.body;
        const user = await authService.registerUser(username, email, password, phonenumber);
        const token = generateToken(user.id);

        return res.status(201).json({
            user,
            token,
        });
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Register error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await authService.loginUser(email, password);
        const token = generateToken(user.id);

        return res.json({
            user,
            token,
        });
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
