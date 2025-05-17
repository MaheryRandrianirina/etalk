import { CsrfData } from "@/types/data"
import axios, { AxiosError } from "axios"

function handleCsrfTokenError(e: AxiosError<any>, cb?: ()=>void) {
    if(e.response?.data.type || e.response?.data.type !== "csrf-error") {
        return
    }

    axios.get("/api/csrf").then(res => {
        const data = res.data as CsrfData
        sessionStorage.setItem("_csrf", data.csrf)

        cb && cb()
    }).catch(error => console.error("Il y a eu une erreur lors de la recuperation du token csrf"))
}

export { handleCsrfTokenError }