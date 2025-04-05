import styles from "@/styles/sass/modules/loader.module.scss"
import LogoDuringLoader from "@/components/atoms/decors/logoDuringLoader"

export default function AppLogoAndName(): JSX.Element {
    return <div className={styles.applogo_and_name}>
        <LogoDuringLoader/>
        <div className={styles.app_name}>ETALK</div>
    </div>
}