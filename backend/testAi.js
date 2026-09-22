require('dotenv').config();
const { generateResponse } = require('./services/aiService');

const test = async () => {
  try {
    const response = await generateResponse("Hello!", { role: "student", name: "Ritesh" });
    console.log("Success:", response);
  } catch (error) {
    console.error("Failed:", error);
  }
};

test();
