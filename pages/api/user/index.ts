import UserTable from "../../../backend/database/tables/UserTable";
import { withSessionRoute } from "../../../backend/utilities/withSession";
import { NextApiRequest, NextApiResponse } from "next/types";
import { User as UserType } from "../../../types/user";
import { ConversationUser } from "../../../types/Database";
import ConversationUserTable from "../../../backend/database/tables/ConversationUserTable";

export default withSessionRoute(User)

async function User(req: NextApiRequest, res: NextApiResponse){
    const userTable = new UserTable<UserType>()
    const conversationUserTable = new ConversationUserTable<ConversationUser>()

    const {user} = req.session
    if(user && req.method === "GET"){
        const {name, sender_id, id } = req.query
        if(name !== undefined 
            && typeof name === "string"
            && sender_id !== undefined
            && typeof sender_id === "string"
        ){
            const users = await userTable.search(
                ["username", "firstname", "name", "id"], 
                ["username", "name", "firstname"],
                { values: [`%${name}%`, `%${name}%`, `%${name}%`], operator: "OR"}
            ) as UserType[]
            
            const authUserConversations = await conversationUserTable.where<undefined>(
                ["user_id"],
                [user.id]
            ).get() as ConversationUser[]

            let usersWithNoConversationWithAuthUser: UserType[] = [];
            
            for(let i = 0; i < users.length; i++){
                const foundUser = users[i];
                const receiverConversations = await conversationUserTable.where<undefined>(
                    ["user_id"],
                    [foundUser.id]
                ).get() as ConversationUser[]
                    
                if(receiverConversations.length > 0
                    && authUserConversations.length > 0
                    
                ){
                    receiverConversations.forEach(receiverConversation => {
                        authUserConversations.forEach(authUserConversation => {
                            if(receiverConversation.conversation_id === authUserConversation.conversation_id){
                                usersWithNoConversationWithAuthUser = usersWithNoConversationWithAuthUser.concat(users.filter((value)=>{
                                        return value !== foundUser
                                    })
                                ) 
                            }
                        })
                    })
                    
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
    }
    
}