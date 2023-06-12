import Data from "../../lib/data"

export default class DateHelper {

    private minutesInMs = 60 * 1000
    private hourInMs = 3600 * 1000
    private dayInMS = this.hourInMs * 24
    private weekInMs = this.dayInMS * 7

    private weekDays: {[index: number]: string} = {
        1: "Lun",
        2: "Mar",
        3: "Mer",
        4: "Jeu",
        5: "Ven",
        6: "Sam",
        7: "Dim"
    }

    format(appDate: Date | string): string {
        let formatedDate: string = ""
        let date
        
        const jsDate = new Date()

        if(appDate instanceof Date){
            date = appDate
        }else {
            date = new Date(appDate)
        }
        
        const timeDiff = jsDate.getTime() - date.getTime()
        if(timeDiff < this.minutesInMs){
            formatedDate = "A l'instant"
        }else if(timeDiff < this.hourInMs){
            formatedDate = "Il y a " + Math.floor(this.getMinutes(timeDiff)) + " minutes"
        }else if(timeDiff === this.hourInMs){
            formatedDate = "Il y a 1h" 
        }else if(timeDiff < this.dayInMS){
            formatedDate = `${date.getHours()}: ${date.getMinutes()}`
        }else if(timeDiff > this.dayInMS && timeDiff < this.dayInMS * 2){
            formatedDate = "Hier à " + date.getHours() + ":" + date.getMinutes()
        }else if(timeDiff > this.dayInMS * 2){
            formatedDate = this.getWeekDay(date.getDay()) + ". " + date.getHours() + ':' + date.getMinutes()
        }

        return formatedDate
    }

    getMinutes(timestamp: number): number {
        return timestamp  / this.minutesInMs
    }

    getHours(timestamp: number): number {
        return (timestamp * 24) / this.dayInMS
    }

    getWeekDay(dayNumber: number): string {
        return this.weekDays[dayNumber]
    }

    
}