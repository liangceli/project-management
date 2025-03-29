import { Request, Response} from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const search = async (req: Request, res: Response): Promise<void> => {
    const { query } = req.query;
    try {
        const tasks = await prisma.task.findMany({
            where: {
                  OR: [ // 这是 查询条件（filter）。
                        // OR 是一个逻辑运算符，表示只要满足其中一个条件就会被返回（逻辑“或”）。
                    {title: {contains: query as string}},
                    {description: {contains: query as string}},
                ],
            },
        });
        
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: query as string } },
                    {description: {contains: query as string}},
                ],
            },
        });

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {username: {contains: query as string}},
                ],
            },
        });
        res.json({tasks, projects, users});
    } catch (error: any) {
        res.status(500).json({message: `Error performing search: ${error.message}`});
    }
};