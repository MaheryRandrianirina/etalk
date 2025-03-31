<<<<<<< HEAD
import { getSession } from "@/lib/index"
import type { NextApiRequest, NextApiResponse } from "next"


export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}){
    const session = await getSession(req, res)
    if(session?.user){
=======
import type { NextResponse } from "next/server"
import { RequestWithSession } from "../../types/session"


export async function getServerSideProps({req, res}: {req: RequestWithSession, res: NextResponse}){
    if(req.session?.user){
>>>>>>> 929a86fddfdd0fe7cf92aaf12ba32d67f3fdb2d2
        return {
            props: {},
            redirect: {
                permanent: true,
                destination: "/forbidden",
                basePath: false
            }
        }
    }

    return {
        props: {}
    }
}