import {Request, Response} from "express";
import { PrismaClient } from "@prisma/client";

const prisma =  new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.query;

    try {
        const tasks = await prisma.task.findMany({
            where: {
                projectId: Number(projectId),
            },
            include: {
                author: true,
                assignee: true,
                comments: true,
                attachments: true,
            },

        });
        res.json(tasks)
    } catch (error:any) {
        res.status(500).json({message: `Error retrieving tasks: ${error.message}`})
    }
}

export const createTask = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const {
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      points,
      projectId,
      authorUserId,
      assignedUserId,
    } = req.body;
    try {
      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          status,
          priority,
          tags,
          startDate,
          dueDate,
          points,
          projectId,
          authorUserId,
          assignedUserId,
        },
      });
      res.status(201).json(newTask);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: `Error creating a task: ${error.message}` });
    }
  };

  export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    const { status } = req.body;
    const { taskId } = req.params;
    try {
        const updatedTask = await prisma.task.update({
            where: {
                id: Number(taskId),
            },
            data: {
                status: status,
            }

        });
        res.json(updatedTask)
    } catch (error:any) {
        res.status(500).json({message: `Error updating task: ${error.message}`})
    }
}

export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
      const tasks = await prisma.task.findMany({
          where: {
            OR: [ // OR: 满足两个条件之一即可被查询出来：
              {authorUserId: Number(userId)}, // 此用户是任务的创建者
              {assignedUserId: Number(userId)}, // 此用户是任务的被指派者
            ],
          },
          include: { //include 告诉 Prisma 同时查出任务对应的作者和被分配者的信息
              author: true,
              assignee: true,
          },

      });
      res.json(tasks)
  } catch (error:any) {
      res.status(500).json({message: `Error retrieving user's tasks: ${error.message}`})
  }
};


