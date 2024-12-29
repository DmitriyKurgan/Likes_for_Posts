import {inject, injectable} from "inversify";

import { BlogsService} from "../application/blogs-service";
import { PostsService} from "../application/posts-service";
import {BlogsQueryRepository} from "../infrastructure/repositories/query-repositories/blogs-query-repository";
import {PostsQueryRepository} from "../infrastructure/repositories/query-repositories/posts-query-repository";

import {Request, Response} from "express";
import {CodeResponsesEnum, getQueryValues} from "../utils/utils";
import {BlogViewModel} from "../models/view/BlogViewModel";
import {PostViewModel} from "../models/view/PostViewModel";


@injectable()
export class BlogsController {
    constructor(
        @inject(BlogsService) protected blogsService: BlogsService,
        @inject(PostsService) protected postsService: PostsService,
        @inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository,
        @inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository
    ) {}

    async getBlogs (req:Request, res:Response){
        const queryValues = getQueryValues({
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchNameTerm:req.query.searchNameTerm
        })

        const blogs = await this.blogsQueryRepository.getAllBlogs({...queryValues})
        if(!blogs || !blogs.items.length) {
        return res.status(CodeResponsesEnum.Not_found_404).send([])
    }
    res.status(CodeResponsesEnum.OK_200).send(blogs)
  }

    async getSpecificBlog (req:Request, res:Response){
        const blogID = req.params.id

        const blogByID: BlogViewModel | null = await this.blogsQueryRepository.findBlogByID(blogID)
        if (!blogID || !blogByID){
            return res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
        res.status(CodeResponsesEnum.OK_200).send(blogByID)
   }

    async getPostsForBlog (req:Request, res:Response){
        const blogID = req.params.id

        const blogByID: BlogViewModel|null = await this.blogsQueryRepository.findBlogByID(blogID)
        if(!blogID || !blogByID){
            return res.sendStatus(CodeResponsesEnum.Not_found_404)
        }

        const queryValues = getQueryValues({
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchNameTerm:req.query.searchNameTerm
        })
//@ts-ignore
        const posts = await this.postsQueryRepository.findAllPostsByBlogID(blogID, {...queryValues})

        if (!posts || !posts.items.length) {
            return res.status(CodeResponsesEnum.OK_200).send([])
        }

        res.status(CodeResponsesEnum.OK_200).send(posts)
    }

    async createBlog (req:Request, res:Response){
        const newBlog: BlogViewModel | null = await this.blogsService.createBlog(req.body)
        if (newBlog){
            res.status(CodeResponsesEnum.Created_201).send(newBlog)
        }
    }

    async createPostForBlog (req:Request, res:Response){
        const blogID = req.params.id;

        const blogByID: BlogViewModel | null = await this.blogsQueryRepository.findBlogByID(blogID);
        if(!blogID || !blogByID){
            res.sendStatus(CodeResponsesEnum.Not_found_404);
            return
        }
        const newPost: PostViewModel | null = await this.postsService.createPost(req.body, blogByID.name, blogID);
        if (newPost){
            res.status(CodeResponsesEnum.Created_201).send(newPost);
        }
    }

     async updateBlog (req:Request, res:Response) {
        const blogID = req.params.id;
        const isUpdated:boolean = await this.blogsService.updateBlog(blogID, req.body);
        if (!isUpdated || !blogID){
            res.sendStatus(CodeResponsesEnum.Not_found_404);

        }

        const blog = await this.blogsQueryRepository.findBlogByID(blogID);
        res.status(CodeResponsesEnum.Not_content_204).send(blog);
    }

    async deleteBlog (req:Request, res:Response){
        const blogID:string = req.params.id;
        const isDeleted:boolean = await this.blogsService.deleteBlog(blogID);
        if (!isDeleted || !blogID){
            return res.sendStatus(CodeResponsesEnum.Not_found_404);
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204);
    }

}