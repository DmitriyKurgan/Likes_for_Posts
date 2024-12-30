import {Router} from "express";
import {UsersController} from "../controllers/UsersController";
import {validateBasicAuthorization} from "../middlewares/auth/auth-basic";
import {validateUserFindByParamId, validationUserUnique} from "../middlewares/validations/find-by-id/user-validation";
import {validateUsersRequestsInputParams} from "../middlewares/validations/input/user-input-validation";
import {validateErrorsMiddleware} from "../middlewares/general-errors-validator";
import {container} from "../composition-root";

export const usersRouter = Router({})

const usersController = container.resolve(UsersController)

usersRouter.get(
    '/',
    validateBasicAuthorization,
    validateErrorsMiddleware,
    usersController.getUsers.bind(usersController)
)


usersRouter.post(
    '/',
    validateBasicAuthorization,
    validationUserUnique("login"),
    validationUserUnique("email"),
    validateUsersRequestsInputParams,
    validateErrorsMiddleware,
    usersController.createUser.bind(usersController)
)

usersRouter.delete(
    '/:id',
    validateBasicAuthorization,
    validateUserFindByParamId,
    validateErrorsMiddleware,
    usersController.deleteUser.bind(usersController)
)


