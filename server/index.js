const express = require("express");
const next = require("next");
const multer = require("multer");

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({dev})
const handle = app.getRequestHandler()

app.prepare()
    .then(() => {
        const upload = multer({dest: "../storage/"})
        
        const server = express()

        server.get("*",(req, res) => {
            return handle(req, res)
        }) 
        
        server.post("/api/upload", upload.single('profile_photo'), (req, res,next) => {
            console.log(req)
        })

        server.post("*", (req, res) => {
            return handle(req, res)
        })
        
        server.listen(port)
        
    }).catch(err => {
        console.error(err)
    })