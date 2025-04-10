import { getSession } from "@/lib/index"
import type { NextApiRequest, NextApiResponse } from "next"


export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}){
    const session = await getSession(req, res);
    
    if(session.user){
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