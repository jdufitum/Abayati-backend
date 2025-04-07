const express = require('express')
const router = express.Router()
const {createMeasurements,getMeasurementsById,getAllPersons,createTryOnTask, getTryOnStatus} = require("../controllers/measurementsController")
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/user/getMeasurement/",getMeasurementsById)
router.get("/user/getMeasurements/",getAllPersons)
router.post("/user/virtualTryon/", upload.fields([{ name: 'humanImage', maxCount: 1 }, { name: 'clothImage', maxCount: 1 }]),createTryOnTask)
router.post("/user/createMeasurements", upload.fields([{ name: 'front_image', maxCount: 1 }, { name: 'side_image', maxCount: 1 }]),createMeasurements)
module.exports = router  