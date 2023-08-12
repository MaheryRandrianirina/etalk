type ModalData<T extends "confirmation"> = {
    show: boolean, 
    type: T,
    data: T extends "confirmation" ? string : never
}

export type {ModalData}