import UserTable from "../../../backend/database/tables/UserTable";
import { NextApiRequest, NextApiResponse } from "next/types";
import { User as UserType } from "../../../types/user";
import { Conversation, ConversationUser } from "../../../types/Database";
import ConversationUserTable from "../../../backend/database/tables/ConversationUserTable";
import { getSession } from "@/lib";
import ConversationTable from "@/backend/database/tables/ConversationTable";


export default async function User(req: NextApiRequest, res: NextApiResponse){
    

    const session = await getSession(req, res)
    const user = session.user
    
    if(user && req.method === "GET"){
        const {name, sender_id, id } = req.query
        
        try {
            const userTable = new UserTable<UserType>()

            if(name !== undefined 
                && typeof name === "string"
                && sender_id !== undefined
                && typeof sender_id === "string"
            ){
                const usersFound = await userTable.search(
                    ["username", "firstname", "name", "id"], 
                    ["username", "name", "firstname"],
                    { values: [`%${name}%`, `%${name}%`, `%${name}%`], operator: "OR"}
                ) as UserType[]
                const users = usersFound.filter(user => user.id !== parseInt(sender_id))
                
                let usersWithNoConversationWithAuthUser: UserType[] = [];

                for(let i = 0; i < users.length; i++){
                    const foundUser = users[i];

                    const conversationTable = new ConversationTable<Conversation>()
                    const authUserConversationsWithFoundOne = await conversationTable.where<undefined>(
                        ["initializer_id", "adressee_id"],
                        [user.id, foundUser.id]
                    ).get() as ConversationUser[]

                    if (authUserConversationsWithFoundOne.length === 0) {
                        usersWithNoConversationWithAuthUser.push(foundUser);
                    }
                }
                
                res.status(200).json({success: true, users: usersWithNoConversationWithAuthUser})
            }else if(id !== undefined && typeof id === "string"){
                const [foundUser] = await userTable.columns([
                    "id", "name", "username", 
                    "firstname", "email", "sex", 
                    "image", "is_online"
                ]).find(parseInt(id)) as UserType[]

                res.status(200).json({success: true, user: foundUser})
            }else {
                res.status(500).json({success: false, error: "undefined name"})
            }  
        }catch(e){
            console.error(e)
        }
    }
    
}