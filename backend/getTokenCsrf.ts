import axios from "axios"

export default async function generateToken(): Promise<any> {
    try {
      const response = await axios.get("/api/csrf")
      return response
    }catch(error) {
      console.error(error)
    }
}