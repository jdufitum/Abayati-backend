require("dotenv").config();
const axios = require("axios");
const { cloudinary } = require("../utils/cloudinary");
const Product = require("../models/Product")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const ACCESS_KEY = process.env.KLING_ACCESS_KEY; // Your Access Key ID
const SECRET_KEY = process.env.KLING_SECRET_KEY; // Your Secret Key

function generateApiToken() {
    const payload = {
        iss: ACCESS_KEY, 
        exp: Math.floor(Date.now() / 1000) + 1800, // Expires in 30 minutes
        nbf: Math.floor(Date.now() / 1000) - 5     // Becomes valid 5 seconds earlier
    };

    const token = jwt.sign(payload, SECRET_KEY, { algorithm: "HS256" });
    return token; 
}

function extractTaskSetId(taskSetUrl) {
  return taskSetUrl.split('/').slice(-2, -1)[0];
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.createMeasurements = async (req, res) => {
  try {
    const { name, gender, height, weight } = req.body;
    const frontImage = req.files["front_image"]?.[0];
    const sideImage = req.files["side_image"]?.[0];

    if (!frontImage || !sideImage) {
      return res.status(400).send({ message: "Both front and side images are required." });
    }

    if (height < 150 || height > 220) {
      return res.status(400).send({ message: "The height must be >=150 and <=220 cm" });
    }

    if (weight < 30 || weight > 200) {
      return res.status(400).send({ message: "The weight must be >=30 and <=200 kg" });
    }

    // Decode token to get user ID
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded._id);

    let taskSetId = user.taskSetId;

    // If user doesn't have a taskSetId yet, create one and save it
    if (!taskSetId) {
      const front_image = frontImage.buffer.toString("base64");
      const side_image = sideImage.buffer.toString("base64");

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

      // Extract and save taskSetId
      taskSetId = extractTaskSetId(response.data.task_set_url);
      user.taskSetId = taskSetId;
      await user.save();
      return res.status(201).send({ data: response.data, message: "Your measurement is being processed. Please check back later." });
    }

    // do {
    //   responsee = await axios.get(
    //     `https://saia.3dlook.me/api/v2/queue/${taskSetId}`,
    //     {
    //       headers: {
    //         "Authorization": `APIKey ${process.env.THREEDLOOK_API_KEY}`,
    //       },
    //     }
    //   );

    //   if (!responsee.data.is_ready) {
    //     await new Promise(resolve => setTimeout(resolve, 4000)); // wait 4s
    //   }

    // } while (!responsee.data.is_ready);

    // if (responsee.data.is_successful) {
      return res.send({message: "Your measurement is being processed. Please check back later." });

  } catch (error) {
    console.error("Error in createMeasurements:", error.response?.data || error.message);
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
  // / Extract person_id from the request parameters
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded._id);
    
    const taskid = user.taskSetId; 
    
    const response = await axios.get(
      `https://saia.3dlook.me/api/v2/queue/${taskid}`,
      {
        headers: {
          Authorization: `APIKey ${process.env.THREEDLOOK_API_KEY}`,
        },
      }
    );
    // const response = await axios.get(
    //   `${process.env.THREEDLOOK_GET_URL}/${personId}/`,
    //   {
    //     headers: {
    //       Authorization: `APIKey ${process.env.THREEDLOOK_API_KEY}`,
    //     },
    //   }
    // );
    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to get measurements" });
  }
}

exports.createTryOnTask = async (req, res) => {
  const token = generateApiToken();
  try {
    const { modelName } = req.body;
    const humanImage = req.files["humanImage"][0].buffer.toString("base64")
    // const clothImage = req.files["clothImage"][0].buffer.toString("base64")
    if (!humanImage) {
      return res.status(400).json({ success: false, error: "humanImage is required" });
    }

    const clothId = req.body.clothId
    const cloth = await Product.findById(clothId)
    if(!cloth){
      return res.status(404).send({message:"Invalid product id", error:"Not found"})
    }
    console.log("clotheeeee ",cloth.imgUrl)

    const data = await axios.get(cloth.imgUrl, { responseType: 'arraybuffer' });
    let clothImage = Buffer.from(data.data, 'binary').toString('base64');
    clothImage = clothImage.replace(/^data:image\/[a-z]+;base64,/, '');

    const payload = {
      model_name: modelName || "kolors-virtual-try-on-v1-5",
      human_image: humanImage, 
      cloth_image: clothImage || null,
    };

    const response = await axios.post(`${process.env.KLING_API_URL}`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
    }); 
    const taskId = response.data.data.task_id
    console.log("Waiting for 60 seconds for processing to complete...")
    await new Promise((resolve) => setTimeout(resolve, 60000));

    const result = await axios.get(`${process.env.KLING_API_URL}/${taskId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.status(200).json({ success: true, data: result.data.data});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to create virtual try-on task" });
  }
};
