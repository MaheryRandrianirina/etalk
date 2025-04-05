import styles from "@/styles/sass/modules/loader.module.scss"
import Copyright from "@/components/atoms/copyright";
import AppLogoAndName from "@/components/molecules/appLogoAndName";

export default function Opening(): JSX.Element {
    return <div className={styles.opening_app_loader}>
        <AppLogoAndName/>
        <Copyright/>
    </div>
}