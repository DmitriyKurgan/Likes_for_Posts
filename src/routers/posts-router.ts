import {Router} from "express";
import {validateBasicAuthorization} from "../middlewares/auth/auth-basic";
import {validateBearerAuthorization} from "../middlewares/auth/auth-bearer";
import {validatePostsRequestsInputParams} from "../middlewares/validations/input/post-input-validation";
import {validateCommentsRequestsInputParams} from "../middlewares/validations/input/comment-input-validation";
import {validateErrorsMiddleware} from "../middlewares/general-errors-validator";
import {
    validateBlogIdForPostsRequestsInputParams
} from "../middlewares/validations/input/blog-id-for-post-creation-input-validation";
import {container} from "../composition-root";
import {PostsController} from "../controllers/PostsController";
import {validateLikesRequestsInputParams} from "../middlewares/validations/input/like-for-comment-input-validation";
import {tokenParser} from "../middlewares/auth/token-parser";
import {validationPostsFindByParamId} from "../middlewares/validations/find-by-id/post-validation";

export const postsRouter = Router({})

const postsController = container.resolve(PostsController)

postsRouter.get(
    '/',
    tokenParser,
    validateErrorsMiddleware,
    postsController.getPosts.bind(postsController)
)

postsRouter.get(
    '/:id',
    validationPostsFindByParamId,
    tokenParser,
    validateErrorsMiddleware,
    postsController.getSpecificPost.bind(postsController)
)

postsRouter.get(
    '/:id/comments',
    validateBearerAuthorization,
    validateErrorsMiddleware,
    postsController.getAllCommentsOfPost.bind(postsController)
)

postsRouter.post(
    '/',
    validateBasicAuthorization,
    validatePostsRequestsInputParams,
    validateBlogIdForPostsRequestsInputParams,
    validateErrorsMiddleware,
    postsController.createPost.bind(postsController)
)

postsRouter.post(
    '/:id/comments',
    validateBearerAuthorization,
    validateCommentsRequestsInputParams,
    validateErrorsMiddleware,
    postsController.createCommentForPost.bind(postsController)
)


postsRouter.put(
    '/:id',
    validateBasicAuthorization,
    validatePostsRequestsInputParams,
    validateBlogIdForPostsRequestsInputParams,
    validationPostsFindByParamId,
    validateErrorsMiddleware,
    postsController.updatePost.bind(postsController)
)

postsRouter.delete(
    '/:id',
    validateBasicAuthorization,
    validateErrorsMiddleware,
    postsController.deletePost.bind(postsController)
)

postsRouter.put(
    "/:id/like-status",
    validationPostsFindByParamId,
    validateBearerAuthorization,
    validateLikesRequestsInputParams,
    validateErrorsMiddleware,
    postsController.updateLikeStatus.bind(postsController)
);