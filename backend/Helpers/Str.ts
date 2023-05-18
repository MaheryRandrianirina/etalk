import { randomBytes } from "crypto";

export default class Str {
    
    static random(length: number): string {
        return randomBytes(64).toString("hex").slice(0, length)
    }
}