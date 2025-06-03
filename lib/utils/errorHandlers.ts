import axios, { AxiosError } from "axios"

function handleCsrfTokenError(e: AxiosError<any>, cb: Function|null = null) {
    if("type" in e.response?.data === false || e.response?.data.type !== "csrf-error") {
        return
    }

    axios.get("/api/csrf").then(res => {
        cb && cb()
    }).catch(error => {
        console.error("Il y a eu une erreur lors de la recuperation du token csrf")
    })
}

export { handleCsrfTokenError }