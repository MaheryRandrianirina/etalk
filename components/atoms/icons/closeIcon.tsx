import { FC, MouseEventHandler } from "react";

const CloseIcon: FC<{
    onClick?: MouseEventHandler<SVGElement>
}> = ({onClick}): JSX.Element => {
    return <svg onClick={onClick}  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="close_icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
}

export default CloseIcon