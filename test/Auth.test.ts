import { NextApiRequest, NextApiResponse } from "next"
import Auth from "../backend/User/Auth"

describe('test Auth class', ()=>{
    const req = {
        query: {},
        body: {

        },
        session: {
            user: {
                id: 1,
                username: "mahery",
                is_online: true
            }
        }
    } as NextApiRequest

    const res = {

    } as NextApiResponse

    test("isAuthenticated method return true",()=>{
        const auth = new Auth(req)
        expect(auth.isAuthenticated()).toBeTruthy()
    })

    test("method storedAsCookie return true", ()=>{
        
        
    })
})