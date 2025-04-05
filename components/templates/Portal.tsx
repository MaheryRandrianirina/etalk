import { PropsWithChildren, useEffect, useState } from "react"
import { createPortal } from "react-dom"

export const Portal = ({children}: PropsWithChildren)=>{
    const [mounted, setMounted] = useState(false)
    const [container, setContainer] = useState<Element|null>(null)

    useEffect(()=>{
        setMounted(true)
        setContainer(document.body)
    }, [])

    return mounted && container ? createPortal(children, container) : null
}