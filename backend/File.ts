import { realpath, writeFile } from "fs"
import Str from "./Helpers/Str"
import * as FormData from "form-data"

export default class FileHelper {
    private storagePath: string = "../storage"

    upload(path: string, file: File): string {
        const realPath = path.replaceAll('.', '/') + "/" 
            + parseInt(path.split(".")[2]) 
            + Str.random(16)
            + file.name
        // writeFile(`${this.storagePath}/${realpath}`, file, (err, data)=>{
            
        // })
        
        return ""
    }
}