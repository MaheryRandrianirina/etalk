type ModalData<T extends "confirmation"> = {
    show: boolean, 
    type: T,
    data: T extends "confirmation" ? string : never,
    className?: string
}

export type {ModalData}