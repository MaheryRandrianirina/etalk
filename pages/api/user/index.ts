import UserTable from "../../../backend/database/tables/UserTable";
import { withSessionRoute } from "../../../backend/utilities/withSession";
import { NextApiRequest, NextApiResponse } from "next/types";
import { User } from "../../../types/user";
export default withSessionRoute(User)

async function User(req: NextApiRequest, res: NextApiResponse){
    const userTable = new UserTable<User>()
    
    if(req.method === "GET"){
        const {name} = req.query
        if(name !== undefined && typeof name === "string"){
            const users = await userTable.search(
                ["username", "firstname", "name", "id"], 
                ["username", "name", "firstname"],
                {values: [`%${name}%`, `%${name}%`, `%${name}%`], operator: "OR"}
            )
            
            res.status(200).json({success: true, users: users})
        }else {
            res.status(500).json({success: false, error: "undefined name"})
        }
        
    }
    
}