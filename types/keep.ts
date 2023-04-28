type Keep<T, U> = T extends U ? T : never 

export type {Keep}