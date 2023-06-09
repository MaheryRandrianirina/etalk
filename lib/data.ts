import axios from "axios"

export default class Data {
    
    public async post(url: string, data:{}): Promise<unknown> {
        try {
            const res = await axios.post(url, data)
            return res
        }catch(error){
            throw error
        }
    }
}