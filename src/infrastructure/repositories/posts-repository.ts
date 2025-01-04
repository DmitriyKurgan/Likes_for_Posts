import {ObjectId, UpdateResult, DeleteResult} from "mongodb";
import {PostsModel} from "./db";
import {PostDBModel} from "../../models/database/PostDBModel";
import {PostViewModel} from "../../models/view/PostViewModel";
import {injectable} from "inversify";
import {HydratedDocument} from "mongoose";

export const posts = [] as PostViewModel[]
@injectable()
export class PostsRepository {
    async createPost(newPost:PostDBModel):Promise<PostViewModel | null> {
        const post = await PostsModel.create(newPost)

        return {
            id: post._id.toString(),
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: newPost.blogName,
            createdAt: newPost.createdAt,
            extendedLikesInfo: {
                likesCount: newPost.likesInfo.likesCount,
                dislikesCount: newPost.likesInfo.dislikesCount,
                myStatus: "None",
                newestLikes: []
            }
        }
    }
    async updatePost(postID:string, body: PostDBModel): Promise<boolean> {
        const result: UpdateResult<PostDBModel> = await PostsModel.updateOne({_id: new ObjectId(postID)},
            {$set: {
                    title: body.title,
                    shortDescription: body.shortDescription,
                    content: body.content,
                    blogId: body.blogId
                }});
        return result.matchedCount === 1
    }
    async deletePost(postID:string){

        const result: DeleteResult = await PostsModel.deleteOne({_id: new ObjectId(postID)})

        return result.deletedCount === 1
    }

    async deleteAll(): Promise<boolean> {
        await PostsModel.deleteMany({})
        return (await PostsModel.countDocuments()) === 0
    }

    async findPostByID(postID:string):Promise<HydratedDocument<PostDBModel> | null> {
        return PostsModel.findOne({_id: new ObjectId(postID)});
    }

    async findUserInLikesInfo(
        postId: string,
        userId: ObjectId
    ): Promise<PostDBModel | null> {
        const foundUser = await PostsModel.findOne(
            PostsModel.findOne({
                _id: postId,
                "likesInfo.users.userId": userId,
            })
        )

        if (!foundUser) {
            return null
        }

        return foundUser
    }


    async pushUserInLikesInfo(
        postId: string,
        userId: ObjectId,
        likeStatus: string,
        addedAt: string,
        userLogin: string
    ): Promise<boolean> {
        const result: any = await PostsModel.updateOne(
            { _id: postId },
            {
                $push: {
                    "likesInfo.users": {
                        addedAt,
                        userId,
                        userLogin,
                        likeStatus,
                    },
                },
            }
        )
        return result.matchedCount === 1
    }

    async updatePostLikesCount(
        postId: string,
        likesCount: number,
        dislikesCount: number
    ): Promise<boolean> {
        const result: any = await PostsModel.updateOne(
            { _id: postId },
            {
                $set: {
                    "likesInfo.likesCount": likesCount,
                    "likesInfo.dislikesCount": dislikesCount,
                },
            }
        )
        return result.matchedCount === 1
    }

    async findUserLikeStatus(
        postId: string,
        userId: ObjectId
    ): Promise<string | null> {
        const foundUser: any = await PostsModel.findOne(
            { _id: postId },
            {
                "likesInfo.users": {
                    $filter: {
                        input: "$likesInfo.users",
                        cond: { $eq: ["$$this.userId", userId.toString()] },
                    },
                },
            }
        )
        if (!foundUser) {
            return null
        }

        return foundUser.likesInfo.users?.[0]?.likeStatus
    }

    async updateLikesStatus(
        postId: string,
        userId: ObjectId,
        likeStatus: string
    ): Promise<boolean> {
        const result: any = await PostsModel.updateOne(
            { _id: postId, "likesInfo.users.userId": userId },
            {
                $set: {
                    "likesInfo.users.$.likeStatus": likeStatus,
                },
            }
        )

        return result.matchedCount === 1
    }

}
