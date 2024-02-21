import {createConnection} from "mysql"

console.log(process.env.DB_HOST, process.env.DB_PASSWORD)
const connection = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

export default connection