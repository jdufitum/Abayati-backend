require("dotenv").config();
const axios = require("axios");
const { cloudinary } = require("../utils/cloudinary");
const Product = require("../models/Product")

// app.post("/measurements", upload.fields([{ name: "front" }, { name: "side" }]),
exports.createMeasurements = async (req, res) => {
  try {
    const { name, gender, height,weight } = req.body;
    const frontImage = req.files["front_image"][0];
    const sideImage = req.files["side_image"][0];
    
    const front_image = frontImage.buffer.toString("base64");
    const side_image = sideImage.buffer.toString("base64");;

    const payload = {
      name,
      gender,
      height,
      weight,
      front_image,
      side_image,
      photos: [
        { type: "front_image", content: front_image },
        { type: "side_image", content: side_image },
      ],
    };

    const response = await axios.post(
      `${process.env.THREEDLOOK_MEASUREMENT_URL}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `APIKey ${process.env.THREEDLOOK_API_KEY}`,
        },
      }
    );

    const taskSetUrl = response.data.task_set_url;

    // Poll the task status until it's completed
    const checkTaskStatus = async () => {
      try {
        const taskStatusResponse = await axios.get(taskSetUrl, {
          headers: {
            "Authorization": `APIKey ${process.env.THREEDLOOK_API_KEY}`
          },
        });
        if (taskStatusResponse.data.status === "completed") {
          return res.status(200).send({
            success: true,
            data: taskStatusResponse.data,
          });
        } else {
          setTimeout(checkTaskStatus, 3000); 
        }
      } catch (error) {
        console.error("Error checking task status:", error);
        res.status(500).send({ success: false, error: "Failed to get task status" });
      }
    };
    checkTaskStatus();

    return res.send({ data: response.data, message: "Success" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).send({ error: "Error processing measurements" });
  }
};

exports.getAllPersons = async(req,res)=>{
  try {

    const response = await axios.get(
      `${process.env.THREEDLOOK_GET_URL}`,
      {
        headers: {
          Authorization: `APIKey ${process.env.THREEDLOOK_API_KEY}`,
        },
      }
    );
    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to get measurements" });
  }
}

exports.getMeasurementsById = async (req,res)=>{
  const personId = req.params.personId; // Extract person_id from the request parameters
  try {

    const response = await axios.get(
      `${process.env.THREEDLOOK_GET_URL}/${personId}/`,
      {
        headers: {
          Authorization: `APIKey ${process.env.THREEDLOOK_API_KEY}`,
        },
      }
    );
    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to get measurements" });
  }
}

exports.virtualTryOn = async (req, res) => {
  const { user_id, clothing_id } = req.body;
  try {

    const product = await Product.findById(clothing_id);

    if (!product) {
      return res.status(400).send({
        message: "Clothing ID not found in the database",
        error: "Not found",
      });
    }

    const response = await axios.post(
      `${process.env.THREEDLOOK_GET_URL}/virtual-tryon`,
      {
        user_id,
        clothing_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `APIKey ${process.env.THREEDLOOK_API_KEY}`,
        },
      }
    );

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Virtual Try-On failed" });
  }
};
