import styles from "@/styles/sass/modules/loader.module.scss"

export default function Copyright(): JSX.Element {
    return <div className={styles.copyright}>
        <p className={styles.copyright_owner}>Copyright : Yami San</p>
        <p className={styles.copyright_date}>2022-2023</p>
    </div>
}