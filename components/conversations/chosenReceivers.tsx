import React, { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useEffect, useState } from "react";
import styles from "@/styles/sass/modules/conversations.module.scss"

type Receivers = {id:number, username:string}[]

export const ChosenReceivers: React.FC<{
    receivers:Receivers,
    style: {left: string},
    onClickX: MouseEventHandler<SVGElement>
}> = ({receivers, style, onClickX}) =>{
    const [countBreak, setCountBreak]: [
        countBreak: number,
        setCountBreak: Dispatch<SetStateAction<number>>
    ] = useState(0)

    useEffect(()=>{

        const container = document.querySelector('.chosen_receivers') as HTMLDivElement
        const search_input = document.querySelector('.search_input') as HTMLInputElement
        const chosenReceivers = document.querySelector('.chosen_receivers') as HTMLDivElement

        const containerWidthCollapse = (search_input.offsetWidth - container.offsetWidth === 0) 
            || (search_input.offsetWidth - container.offsetWidth < 80) 
            
        if(containerWidthCollapse){
            if(countBreak === 0){
                search_input.style.height = search_input.offsetHeight * 2 + "px"  
            }

            chosenReceivers.style.height = `${search_input.offsetHeight}px`

            if(countBreak > 0){
                chosenReceivers.scrollTo({
                    top: chosenReceivers.offsetHeight,
                    behavior: 'smooth',
                })
            }

            setCountBreak(c => c + 1)

            chosenReceivers.lastElementChild?.before(document.createElement('br'))
            
        }

    }, [receivers, countBreak])

    return <div className={"chosen_receivers " + styles.chosen_receivers} style={style}>
        {receivers.map(receiver => {
            return <span key={receiver.id} className={styles.chosen_receiver}>
                    <span>{receiver.username}</span>
                    <svg onClick={onClickX} width="24" height="24" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
            </span>
        })}
        
    </div>
}