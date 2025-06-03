import style from "@/styles/sass/modules/error.module.scss"

export const ErrorUI = ({message}: {message: string})=>{
    return <div className={style.error}>
        {message}
    </div>
}