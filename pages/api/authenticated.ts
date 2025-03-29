import type { NextResponse } from "next/server"
import { RequestWithSession } from "../../types/session"


export async function getServerSideProps({req, res}: {req: RequestWithSession, res: NextResponse}){
    if(req.session?.user){
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