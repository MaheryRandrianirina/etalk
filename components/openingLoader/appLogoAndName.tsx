import styles from "../../styles/sass/modules/loader.module.scss"
import Logo from "../decors/logo"

export default function AppLogoAndName(): JSX.Element {
    return <div className={styles.applogo_and_name}>
        <Logo/>
        <div className={styles.app_name}>ETALK</div>
    </div>
}