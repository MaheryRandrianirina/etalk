
import { ReactNode, useContext } from "react";
import { ButtonHTMLAttributes } from "react";
import styles from "@/styles/sass/modules/decorations.module.scss";
import { ButtonContext } from "../organisms/registerStepElements";

function Button({type, children, className, disabled}: ButtonHTMLAttributes<string | boolean | undefined>): JSX.Element {
    const clickEventHandler = useContext(ButtonContext)
    return <button type={type} className={className} onClick={clickEventHandler} disabled={disabled}>{children}</button>
}

function PrimaryButton({children, disabled, className}: {
    children: ReactNode,
    disabled?: boolean,
    className?: string
}): JSX.Element {
    return <Button className={"primary_button " + (className ? className : "")} disabled={disabled}>{children}</Button>
}

function PrimaryButtonWithArrowRight({children, disabled}: {
    children: ReactNode,
    disabled?: boolean
}): JSX.Element {
    return <Button className="primary_button" disabled={disabled}>
        <p>{children}</p>
        <svg style={{float: "right"}} viewBox="0 0 55 24" strokeWidth="2" width="50" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="30" y2="12"></line>
            <polyline points="12 5 19 12 12 19" className={styles.arrow_right_for_button}></polyline>
        </svg>
    </Button>
}

function SecondaryButton({children, className}: {
    children: ReactNode,
    className?: string
}): JSX.Element {
    return <Button className={"secondary_button " + (className ? className : "")}>{children}</Button>
}

function CreateConversationButton(): JSX.Element {
    return <PrimaryButton className="create_conversation">
        <svg  viewBox="0 0 576 512">
            <path d="M402.3 344.9l32-32c5-5 13.7-1.5 13.7 5.7V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h273.5c7.1 0 10.7 8.6 5.7 13.7l-32 32c-1.5 1.5-3.5 2.3-5.7 2.3H48v352h352V350.5c0-2.1.8-4.1 2.3-5.6zm156.6-201.8L296.3 405.7l-90.4 10c-26.2 2.9-48.5-19.2-45.6-45.6l10-90.4L432.9 17.1c22.9-22.9 59.9-22.9 82.7 0l43.2 43.2c22.9 22.9 22.9 60 .1 82.8zM460.1 174L402 115.9 216.2 301.8l-7.3 65.3 65.3-7.3L460.1 174zm64.8-79.7l-43.2-43.2c-4.1-4.1-10.8-4.1-14.8 0L436 82l58.1 58.1 30.9-30.9c4-4.2 4-10.8-.1-14.9z"/>
        </svg>
    </PrimaryButton>
}
export { PrimaryButton, PrimaryButtonWithArrowRight, SecondaryButton, CreateConversationButton }