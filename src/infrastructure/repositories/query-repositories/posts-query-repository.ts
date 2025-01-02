import {ObjectId} from "mongodb";
import {PostsModel} from "../db";
import {FilterQuery, HydratedDocument, SortOrder} from "mongoose";
import {inject, injectable} from "inversify";
import {PostsRepository} from "../posts-repository";
import {PostDBModel} from "../../../models/database/PostDBModel";
import {Paginator} from "../../../models/view/_Paginator";
import {PostViewModel} from "../../../models/view/PostViewModel";

@injectable()
export class PostsQueryRepository {

    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository
    ) {}

    async findPostByID(postID:string, userId?: ObjectId):Promise<HydratedDocument<any> | null> {

      const foundPost: any = await PostsModel.findOne({_id: new ObjectId(postID)})
        if (!foundPost) {
            return null;
        }

        let status;

        if (userId) {
            status = await this.postsRepository.findUserLikeStatus(foundPost._id, userId)
        }

        const likesArray = foundPost.likesInfo.users

          return {
              id: foundPost._id.toString(),
              title: foundPost.title,
              shortDescription: foundPost.shortDescription,
              content: foundPost.content,
              blogId: foundPost.blogId,
              blogName: foundPost.blogName,
              createdAt: foundPost.createdAt,
              extendedLikesInfo: {
                    likesCount: foundPost.likesInfo.likesCount,
                        dislikesCount: foundPost.likesInfo.dislikesCount,
                        myStatus: status || "None",
                        newestLikes: likesArray
                        .filter((post: { likeStatus: string }) => post.likeStatus === "Like")
                        .sort((a: { addedAt: string; }, b: { addedAt: any; }) => -a.addedAt.localeCompare(b.addedAt))
                        .map((post: { addedAt: any, userId: any, userLogin: any }) => {
                            return {
                                addedAt: post.addedAt,
                                userId: post.userId,
                                login: post.userLogin,
                            }
                        })
                        .splice(0, 3),
                }
            }

    }

    async findAllPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string = "createdAt",
        sortDirection: SortOrder,
        userId?: ObjectId,
        blogId?: string
    ): Promise<Paginator<PostViewModel[]>> {
        const filter: FilterQuery<PostDBModel> = {};

        if (blogId) {
            filter.blogId = blogId
        }

        const sortingObj: { [key: string]: SortOrder } = { [sortBy]: "desc" };

        if (sortDirection === "asc") {
            sortingObj[sortBy] = "asc"
        }

        const posts = await PostsModel.find(filter)
            .sort(sortingObj)
            .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
            .limit(pageSize > 0 ? pageSize : 0)
            .lean();

        console.log('posts: ', posts)

        const totalCount = await PostsModel.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)

        return {
            pagesCount: pagesCount,
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: await this.postsMapping(posts, userId),
        }
    }

    private async postsMapping(array: PostDBModel[], userId?: ObjectId) {
        return Promise.all(
            array.map(async (post) => {
                let status

                if (userId) {
                    status = await this.postsRepository.findUserLikeStatus(
                        post._id.toString(),
                        userId
                    )
                }

                const likesArray = post.likesInfo.users
                console.log('likesArray: ', likesArray)
                return {
                    id: post._id.toString(),
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: post.blogId,
                    blogName: post.blogName,
                    createdAt: post.createdAt,
                    extendedLikesInfo: {
                        likesCount: post.likesInfo.likesCount,
                        dislikesCount: post.likesInfo.dislikesCount,
                        myStatus: status || "None",
                        newestLikes: likesArray
                            .filter((post) => post.likeStatus === "Like")
                            .sort((a, b) => -a?.addedAt?.localeCompare(b?.addedAt))
                            .map((post) => {
                                return {
                                    addedAt: post.addedAt.toString(),
                                    userId: post.userId,
                                    login: post.userLogin,
                                }
                            })
                            .splice(0, 3)
                    }
                }
            })
        )
    }

}