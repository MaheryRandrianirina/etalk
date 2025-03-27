const express = require("express");
const next = require("next");
const multer = require("multer");

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000
const dev = process.env.NODE_ENV !== "production"
const app = next({dev})
const handle = app.getRequestHandler()

app.prepare()
    .then(() => {
        const storage = multer.diskStorage({
            destination: "/public/images/user/profile_photo/",
            filename: function (req, file, cb) {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
              cb(null, file.originalname)
            }
        })

        const upload = multer({storage: storage})
        
        const server = express()

        server.get("*", (req, res) => {
            return handle(req, res)
        }) 
        
        server.post("/api/upload", upload.single('profile_photo'), (req, res, next) => {
            res.status(200).json({success: true, file: req.file.originalname})
        })

        server.post("*", (req, res) => {
            return handle(req, res)
        })
        
        server.listen(port)

    }).catch(err => {
        console.error(err)
    })