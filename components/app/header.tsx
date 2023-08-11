import { MouseEventHandler } from "react";

export default function Header({onClickMenu}: {onClickMenu : MouseEventHandler<HTMLDivElement>}): JSX.Element {
    return <div className="app_header">
        <div className="logo">LOGO</div>
        <div className="hamburger_menu" onClick={onClickMenu}>
            <p className="hamburger_menu_bar top"></p>
            <p className="hamburger_menu_bar middle"></p>
            <p className="hamburger_menu_bar bottom"></p>
        </div>
    </div>
}