const express = require("express")
const app = express()
const dotenv = require("dotenv")
dotenv.config()
require("./models/dbConnect")

const port = process.env.PORT
app.listen(port,()=>console.log(`Running on port ${port}`))
