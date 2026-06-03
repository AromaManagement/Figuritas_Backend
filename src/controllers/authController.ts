import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, phonenumber } = req.body;

        if (!username || !email || !password || !phonenumber) {
            return res.status(400).json({ error: "username, email, password and phonenumber are required" });
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existingUser) {
            return res.status(409).json({ error: "Email or username already in use" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { username, email, passwordHash, phonenumber },
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
            expiresIn: "7d",
        });

        return res.status(201).json({
            user: { id: user.id, username: user.username, email: user.email, phonenumber: user.phonenumber },
            token,
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
            expiresIn: "7d",
        });

        return res.json({
            user: { id: user.id, username: user.username, email: user.email },
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
