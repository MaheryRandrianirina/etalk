import { withSessionSsr } from "../../backend/utilities/withSession"

export const getServerSideProps = withSessionSsr(async function getServerSideProps({req, res}){
    
    if(req.session.user){
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
})