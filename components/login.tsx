import { InputCheckbox, InputPassword, InputText } from "./form/input";
import { PrimaryButton } from "./widgets/button";
import Link from "next/link";
export default function Login(): JSX.Element {
    return <div className="login_page">
        <div className="logo">LOGO</div>
        <form action="" method="post">
            <InputText attributes={{className: "username_input", name: "username", value: "", placeholder: "Pseudo"}}/>
            <InputPassword attributes={{className: "password_input", name: "password", value: "*", placeholder: "Mot de passe"}}/>
            <InputCheckbox label="se souvenir de moi" attributes={{className: "remember_me_input", name: "remember_me", checked: false}}/>
            <PrimaryButton>Se connecter</PrimaryButton>
            
            <div className="no_account_yet">
                Pas de compte ? <Link href="/register" className="registration_link_from_login">S&lsquo;inscrire</Link>
            </div>
        </form>
    </div>
}