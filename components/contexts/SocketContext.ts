import { SocketValue } from "@/types/socket/utils";
import { createContext } from "react";

export const SocketContext = createContext<SocketValue|null>(null)