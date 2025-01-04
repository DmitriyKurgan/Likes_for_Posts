import {PostsRepository} from "../infrastructure/repositories/posts-repository";
import {PostViewModel} from "../models/view/PostViewModel";
import {PostDBModel} from "../models/database/PostDBModel";
import {ObjectId} from "mongodb";
import {inject, injectable} from "inversify";
import {UsersQueryRepository} from "../infrastructure/repositories/query-repositories/users-query-repository";

export const posts = [] as PostViewModel[]
@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository
    ) {}
    async createPost(body:PostDBModel, blogName:string,blogID:string):Promise<PostViewModel | null> {

        const newPost = new PostDBModel(
            new ObjectId(),
            body.title,
            body.shortDescription,
            body.content,
            body.blogId ?? blogID,
            blogName,
            new Date().toISOString(),
            {
                likesCount: 0,
                dislikesCount: 0,
                users: [],
            }
        )

        const createdPost: PostViewModel | null = await this.postsRepository.createPost(newPost)
        return createdPost

    }
    async updatePost(postID:string, body:PostDBModel): Promise<boolean> {
        return await this.postsRepository.updatePost(postID,body)
    }
    async deletePost(postID:string){
        return await this.postsRepository.deletePost(postID)
    }

    async updateLikeStatus(
        postId: string,
        userId: ObjectId,
        likeStatus: string,
    ): Promise<boolean> {

        const foundPost = await this.postsRepository.findPostByID(
            postId
        )

        if (!foundPost) {
            return false
        }

        let likesCount = foundPost.likesInfo.likesCount
        let dislikesCount = foundPost.likesInfo.dislikesCount

        const foundUser = await this.postsRepository.findUserInLikesInfo(
            postId,
            userId
        )

        const addedAt = new Date().toISOString()
        const user = await this.usersQueryRepository.findUserByID(userId.toString())
        const login = user!.accountData.userName

        if (!foundUser) {
            await this.postsRepository.pushUserInLikesInfo(
                postId,
                userId,
                likeStatus,
                addedAt,
                login
            )

            if (likeStatus === "Like") {
                likesCount++
            }

            if (likeStatus === "Dislike") {
                dislikesCount++
            }

            return this.postsRepository.updatePostLikesCount(
                postId,
                likesCount,
                dislikesCount
            )
        }

        let userLikeDBStatus = await this.postsRepository.findUserLikeStatus(
            postId,
            userId
        )

        switch (userLikeDBStatus) {
            case "None":
                if (likeStatus === "Like") {
                    likesCount++
                }

                if (likeStatus === "Dislike") {
                    dislikesCount++
                }

                break

            case "Like":
                if (likeStatus === "Like") {
                    likeStatus = 'None'
                }

                if (likeStatus === "None") {
                    likesCount--
                }

                if (likeStatus === "Dislike") {
                    likesCount--
                    dislikesCount++
                }
                break

            case "Dislike":
                if (likeStatus === "Dislike") {
                    likeStatus = 'None'
                }

                if (likeStatus === "None") {
                    dislikesCount--
                }

                if (likeStatus === "Like") {
                    dislikesCount--
                    likesCount++
                }
        }

        await this.postsRepository.updatePostLikesCount(
            postId,
            likesCount,
            dislikesCount
        )

        return this.postsRepository.updateLikesStatus(
            postId,
            userId,
            likeStatus
        )
    }

}
