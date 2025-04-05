import { FC, MouseEventHandler, TransitionEventHandler, useEffect } from "react";
import Modal from "./modal";
<<<<<<< HEAD:components/modals/confirmationModal.tsx
import { PrimaryButton, SecondaryButton } from "../widgets/button";
import useClassnameAnimator from "../../hooks/useClassnameAnimator";
=======
import { PrimaryButton, SecondaryButton } from "../../atoms/button";
import useClassnameAnimator from "../../../hooks/useClassnameAnimator";
>>>>>>> feat/progressBarOnForms:components/molecules/modals/confirmationModal.tsx

const ConfirmationModal: FC<{
    data: string,
    className:string,
    onClickCloseButton: MouseEventHandler<SVGElement>
    transitionendHandler: TransitionEventHandler<HTMLDivElement>
}> = ({data, className, transitionendHandler, onClickCloseButton}): JSX.Element => {
    const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")

    useEffect(()=>{
        setClassnameForAnimation(className)
    })

    return <Modal 
        className={"confirmation " + classnameForAnimation} 
        transitionendHandler={transitionendHandler}
        onClickCloseButton={onClickCloseButton}
    >
        <p className='message'>{data}</p>
        <div className="buttons">
            <SecondaryButton className='ok'>Oui, j&apos;en suis sûr</SecondaryButton>
            <PrimaryButton className='cancel'>Annuler</PrimaryButton>
        </div>
    </Modal>
}

export default ConfirmationModal