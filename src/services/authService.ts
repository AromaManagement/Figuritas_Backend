import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { ServiceError } from "../lib/errors";

export const registerUser = async (username: any, email: any, password: any, phonenumber: any) => {
    if (!username || !email || !password || !phonenumber) {
        throw new ServiceError(400, "username, email, password and phonenumber are required");
    }

    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
        throw new ServiceError(409, "Email or username already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { username, email, passwordHash, phonenumber },
    });

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        phonenumber: user.phonenumber,
    };
};

export const loginUser = async (email: any, password: any) => {
    if (!email || !password) {
        throw new ServiceError(400, "email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new ServiceError(401, "Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
        throw new ServiceError(401, "Invalid credentials");
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
    };
};
