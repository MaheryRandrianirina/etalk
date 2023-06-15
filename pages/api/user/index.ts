import UserTable from "../../../backend/database/tables/UserTable";
import { withSessionRoute } from "../../../backend/utilities/withSession";
import { NextApiRequest, NextApiResponse } from "next/types";
import { User } from "../../../types/user";
import BlockedUsersTable from "../../../backend/database/tables/BlockedUsers";
import { BlockedUsers } from "../../../types/Database";
export default withSessionRoute(User)

async function User(req: NextApiRequest, res: NextApiResponse){
    const userTable = new UserTable<User>()
    const {user} = req.session
    if(user && req.method === "GET"){
        const {name, id} = req.query
        if(name !== undefined && typeof name === "string"){
            const users = await userTable.search(
                ["username", "firstname", "name", "id"], 
                ["username", "name", "firstname"],
                {values: [`%${name}%`, `%${name}%`, `%${name}%`], operator: "OR"}
            )
            
            res.status(200).json({success: true, users: users})
        }else if(id !== undefined && typeof id === "string"){
            const [foundUser] = await userTable.columns([
                "id", "name", "username", 
                "firstname", "email", "sex", 
                "image", "is_online"
            ]).find(parseInt(id)) as User[]

            res.status(200).json({success: true, user: foundUser})
        }else {
            res.status(500).json({success: false, error: "undefined name"})
        }  
    }
    
}