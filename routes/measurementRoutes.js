const express = require('express')
const router = express.Router()
const {createMeasurements,getMeasurementsById,getAllPersons} = require("../controllers/measurementsController")
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/user/getMeasurements/:personId",getMeasurementsById)
router.get("/user/getMeasurements/",getAllPersons)
router.post("/user/measurements", upload.fields([{ name: 'front_image', maxCount: 1 }, { name: 'side_image', maxCount: 1 }]),createMeasurements)
module.exports = router