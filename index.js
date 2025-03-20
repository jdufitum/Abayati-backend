const express = require("express")
const app = express()
const dotenv = require("dotenv")
const bodyParser = require('body-parser')
const cors = require('cors')
const {corsFunction} = require("./utils/cors")

const userRoutes = require("./routes/userRoutes")
const productRoutes = require("./routes/productRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const searchRoutes = require("./routes/searchRoutes")

dotenv.config()
require("./models/dbConnect")

app.use(cors())
app.use(corsFunction)
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(userRoutes)
app.use(productRoutes)
app.use(categoryRoutes)
app.use(searchRoutes)

const port = process.env.PORT
app.listen(port,()=>console.log(`Running on port ${port}`))
