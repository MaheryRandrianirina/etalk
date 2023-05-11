
import { PropsWithChildren, useContext } from "react";
import { ButtonHTMLAttributes } from "react";
import styles from "../../styles/sass/modules/decorations.module.scss";
import { ButtonContext } from "../form/registerStepElements";

function Button({type, children, className}: ButtonHTMLAttributes<string>): JSX.Element {
    const clickEventHandler = useContext(ButtonContext)
    return <button type={type} className={className} onClick={clickEventHandler}>{children}</button>
}

function PrimaryButton({children}: PropsWithChildren): JSX.Element {
    return <Button className="primary_button">{children}</Button>
}

function PrimaryButtonWithArrowRight({children}: PropsWithChildren): JSX.Element {
    return <Button className="primary_button">
        <p>{children}</p>
        <svg style={{float: "right"}} viewBox="0 0 55 24" strokeWidth="2" width="50" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="30" y2="12"></line>
            <polyline points="12 5 19 12 12 19" className={styles.arrow_right_for_button}></polyline>
        </svg>
    </Button>
}

function SecondaryButton({children}: PropsWithChildren): JSX.Element {
    return <Button className="secondary_button">{children}</Button>
}
export { PrimaryButton, PrimaryButtonWithArrowRight, SecondaryButton }