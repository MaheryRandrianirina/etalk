import { Dispatch, SetStateAction, useState } from "react";

export default function useClassnameAnimator(init: string) {
    const [classnameForAnimation, setClassnameForAnimation]: [
        classnameForAnimation: string, 
        setClassnameForAnimation: Dispatch<SetStateAction<string>>
    ] = useState(init)

    return {classnameForAnimation, setClassnameForAnimation}
}