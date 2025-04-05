import loaderStyle from "@/styles/sass/modules/loader.module.scss"

export const ProgressBar = ({progress}:{progress: number})=>{

    return <p className={loaderStyle.progress_bar} style={{width: `${progress}%`}}></p>
}