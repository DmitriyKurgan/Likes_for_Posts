import {ObjectId} from "mongodb";
import {UsersModel} from "../db";
import {UserDBModel} from "../../../models/database/UserDBModel";import {FilterQuery, HydratedDocument, SortOrder} from "mongoose";
import {injectable} from "inversify";

@injectable()
export class UsersQueryRepository {
    async getAllUsers(query: any): Promise<any | { error: string }> {

        const filter: FilterQuery<UserDBModel> = {}

        const {
            searchLoginTerm,
            pageSize,
            pageNumber,
            searchEmailTerm,
            sortBy,
            sortDirection,
        } = query

        if (searchLoginTerm || searchEmailTerm) {
            filter.$or = [];

            if (searchLoginTerm) {
                filter.$or.push({
                    "accountData.login": { $regex: searchLoginTerm, $options: "i" },
                });
            }

            if (searchEmailTerm) {
                filter.$or.push({
                    "accountData.email": { $regex: searchEmailTerm, $options: "i" },
                });
            }
        }

        const sortingObj: { [key: string]: SortOrder } = {
            [`accountData.${sortBy}`]: "desc",
        }

        if (sortDirection === "asc") {
            sortingObj[`accountData.${sortBy}`] = "asc"
        }

        const output = await UsersModel.find(filter)
            .sort(sortingObj)
            .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
            .limit(pageSize > 0 ? pageSize : 0)
            .lean()

        const totalCount = await UsersModel.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)

        return {
            pagesCount: pagesCount,
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: await this.usersMapping(output),
        }


    }
    async findByLoginOrEmail(loginOrEmail:string){
        const user = await UsersModel.findOne({$or: [{"accountData.userName":loginOrEmail}, {"accountData.email":loginOrEmail}]})
        return user
    }
    async findUserByID(userID:string):Promise<HydratedDocument<UserDBModel> | null>{
        return UsersModel.findOne({_id: new ObjectId(userID)})
    }

    public async UserMapper (user : UserDBModel) {
            return {
            _id: user._id,
            id: user._id.toString(),
            accountData:{...user.accountData},
            emailConfirmation:{...user.emailConfirmation},
        }
    }

    private async usersMapping(array: UserDBModel[]) {
        return array.map((user) => {
            return {
                id: user._id.toString(),
                login: user.accountData.userName,
                email: user.accountData.email,
                createdAt: user.accountData.createdAt,
            }
        })
    }
}