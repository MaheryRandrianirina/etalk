import { FC, MouseEventHandler, ReactNode, TransitionEventHandler } from "react";
import CloseIcon from "../../atoms/icons/closeIcon";

const Modal: FC<{
    className?: string,
    children?: ReactNode,
    transitionendHandler: TransitionEventHandler<HTMLDivElement>,
    onClickCloseButton: MouseEventHandler<SVGElement>
}> = ({className, children, transitionendHandler, onClickCloseButton}): JSX.Element => {
    return <div className="modal_container">
        <div className={"modal " + className} onTransitionEnd={transitionendHandler}>
            <CloseIcon onClick={onClickCloseButton}/>
            {children}
        </div>
    </div>
}

export default Modal