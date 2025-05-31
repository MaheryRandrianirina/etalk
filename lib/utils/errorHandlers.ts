import { CsrfData } from "@/types/data"
import axios, { AxiosError } from "axios"
import { Dispatch, SetStateAction } from "react"

function handleCsrfTokenError(e: AxiosError<any>, cb: Function|null = null) {
    if(e.response?.data.type && e.response?.data.type !== "csrf-error") {
        return
    }

    axios.get("/api/csrf").then(res => {
        cb && cb()
    }).catch(error => {
        console.error("Il y a eu une erreur lors de la recuperation du token csrf")
    })
}

export { handleCsrfTokenError }