import {NextFunction, Request, Response} from "express";
import {attemptsRepository} from "../infrastructure/repositories/rate-limit-repository.ts";

export const requestAttemptsMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const timeLimit = new Date(new Date().getTime() - 10000) // 10 sec

    const countOfAttempts = await attemptsRepository
        .countOfAttempts(req.ip!, req.url, timeLimit)

    if (countOfAttempts >= 5) return res.sendStatus(429)

    await attemptsRepository.addAttempts(req.ip!, req.url, new Date())

    next()

}