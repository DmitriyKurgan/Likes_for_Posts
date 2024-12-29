import {BlogsRepository} from "../infrastructure/repositories/blogs-repository";
import {BlogDBModel} from "../models/database/BlogDBModel";
import {ObjectId} from "mongodb";
import {BlogViewModel} from "../models/view/BlogViewModel";
import {injectable} from "inversify";
import {inject} from "inversify";
export const blogs = [] as BlogViewModel[]
@injectable()
export class BlogsService {
    constructor(
        @inject(BlogsRepository) protected blogsRepository: BlogsRepository
    ) {
    }
    async createBlog(body:BlogDBModel):Promise<BlogViewModel | null> {

        const newBlog = new BlogDBModel(
            new ObjectId(),
            body.name,
            body.description,
            body.websiteUrl,
            new Date().toISOString(),
            false
        )

        const createdBlog: BlogViewModel | null = await this.blogsRepository.createBlog(newBlog);
        return createdBlog
    }
    async updateBlog(blogID:string, body:BlogDBModel):Promise<boolean> {
        return await this.blogsRepository.updateBlog(blogID,body)
    }
    async deleteBlog(blogID:string): Promise<boolean>{
        return await this.blogsRepository.deleteBlog(blogID);
    }
}
