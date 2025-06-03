import { createContext, Dispatch, SetStateAction } from "react";

export const ErrorContext = createContext<Dispatch<SetStateAction<string|null>>>(()=>{})