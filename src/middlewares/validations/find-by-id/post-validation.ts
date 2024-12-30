import {container} from "../../../composition-root";

import {param} from "express-validator";

import {PostsQueryRepository} from "../../../infrastructure/repositories/query-repositories/posts-query-repository";

const postsQueryRepository = container.resolve(PostsQueryRepository)

export const validationPostsFindByParamId = param("id").custom(
    async (value) => {

        const result = await postsQueryRepository.findPostByID(value)

        if (!result) {
            throw new Error("ID not found")
        }

        return true
    }
)