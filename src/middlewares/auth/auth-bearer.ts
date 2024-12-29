import {NextFunction, Request, Response} from "express";
import {CodeResponsesEnum} from "../../utils/utils";
import {container} from "../../composition-root";
import {JwtService} from "../../application/jwt-service";

const jwtService = container.resolve(JwtService)

export const validateBearerAuthorization = async (req: Request, res: Response, next: NextFunction)=> {

    if (!req.headers.authorization){
        return res.sendStatus(CodeResponsesEnum.Unauthorized_401)
    }

    const accessToken = req.headers.authorization.split(' ')[1]

    const userId = await jwtService.getUserIdByToken(accessToken)

    if (!userId){
        return  res.sendStatus(CodeResponsesEnum.Unauthorized_401)
    }

    req.userId = userId
    next()
}