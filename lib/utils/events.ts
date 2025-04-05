import { AxiosProgressEvent } from "axios"

export const onUploadProgress = (setProgress: (progress:number)=>void)=>{
    return (progressEvent: AxiosProgressEvent) => {
        const {loaded, total} = progressEvent
        const percentCompleted = total ? Math.round((loaded * 100) / total) : Math.round((loaded * 1024)) // estimate by bytes
        setProgress(percentCompleted)
    }
}