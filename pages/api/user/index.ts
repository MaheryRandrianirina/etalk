import UserTable from "../../../backend/database/tables/UserTable";
import { NextApiRequest, NextApiResponse } from "next/types";
import { AuthUser, User as UserType } from "../../../types/user";
import { Conversation } from "../../../types/Database";
import { getSession } from "@/lib";
import ConversationTable from "@/backend/database/tables/ConversationTable";


export default async function User(req: NextApiRequest, res: NextApiResponse){
    
    const session = await getSession(req, res)
    const user = session.user as UserType
    const {name, sender_id, id, initializer_id, adressee_id } = req.query
       
        try {
            const userTable = new UserTable()

            if(name !== undefined 
                && typeof name === "string"
                && sender_id !== undefined
                && typeof sender_id === "string"
            ){
                const users  = await userTable.raw(`
                    SELECT username, firstname, name, id
                    FROM users
                    WHERE (username LIKE ? OR name LIKE ? OR firstname LIKE ?)
                    AND id != ?
                `, [`%${name}%`, `%${name}%`, `%${name}%`, user.id])
                
                let usersWithNoConversationWithAuthUser: UserType[] = [];

                for(let i = 0; i < users.length; i++){
                    const foundUser = users[i];

                    const conversationTable = new ConversationTable<Conversation>()
                    const authUserConversationsWithFoundOne = await conversationTable.raw(`
                        SELECT * FROM conversation
                        WHERE (initializer_id = ? AND adressee_id = ?) OR (initializer_id = ? AND adressee_id = ?)
                    `, [user.id, foundUser.id, foundUser.id, user.id])

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
            }else if((initializer_id !== undefined && typeof initializer_id === "string") && (adressee_id !== undefined && typeof adressee_id === "string")){
                const [initializer] = await userTable.columns([
                    "id", "name", "username", 
                    "firstname", "email", "sex", 
                    "image", "is_online"
                ]).find(parseInt(initializer_id)) as AuthUser[]

                const [adressee] = await userTable.find(parseInt(adressee_id)) as AuthUser[]

                res.status(200).json({success: true, owners: {initializer, adressee}})
            }else {
                res.status(500).json({success: false, error: "undefined name"})
            }  
        }catch(e){
            console.error(e)
        }
    
}