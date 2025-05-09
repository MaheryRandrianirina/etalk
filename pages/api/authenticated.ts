import { getSession } from "@/lib/index"
import type { NextApiRequest, NextApiResponse } from "next"


export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}){
    console.log("getServerSideProps")
    if(res.statusCode === 201){
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