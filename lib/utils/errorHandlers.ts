import { CsrfData } from "@/types/data"
import axios, { AxiosError } from "axios"

function handleCsrfTokenError(e: AxiosError<any>, cb: (()=>void)|null = null, setError?: unknown) {
    if(e.response?.data.type && e.response?.data.type !== "csrf-error") {
        return
    }

    axios.get("/api/csrf").then(res => {
        cb && cb()
    }).catch(error => {
        console.error("Il y a eu une erreur lors de la recuperation du token csrf")
        // setError
    })
}

export { handleCsrfTokenError }