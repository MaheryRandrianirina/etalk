import styles from "../../styles/sass/modules/loader.module.scss"
import Copyright from "../copyright";
import AppLogoAndName from "../openingLoader/appLogoAndName";

export default function Opening(): JSX.Element {
    return <div className={styles.opening_app_loader}>
        <AppLogoAndName/>
        <Copyright/>
    </div>
}