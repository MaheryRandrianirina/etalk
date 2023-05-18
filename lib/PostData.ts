import axios from "axios"
import { UserIdentity, UserUniqueProperties } from "../types/user"
import { PostDataReturnType } from "../types/registration/dataBaseCommunication"

export const PostData: (step: number, data: UserIdentity | UserUniqueProperties | {image:File})=>Promise<PostDataReturnType> 
= async (step, data): Promise<any> => {
try {
    let res
    if("image" in data){
        if(data.image.size <=10 * 1024 *1024){
            res = await axios.postForm("/api/register", {
                "filename": data.image.name,
                "file": data.image 
            })
        }else {
            console.error("Le fichier est trop volumineux")
        }
    }else {
        res = await axios.post("/api/register", {registrationStep: step, data: data})
    }
    
    if(res?.statusText === "OK"){
        return res.data
    }
}catch(error){
    throw error
}
}