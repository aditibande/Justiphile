import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// Load environment variables from gemini.env file
dotenv.config({ path: './gemini.env' });

const app = express();
const PORT = 3000; // The port your server will listen on

// Retrieve the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
console.log("Is API key set:", API_KEY ? "Yes" : "No"); // Log to check if API key is loaded

// Check if the API key is present
if (!API_KEY) {
  console.error("❌ API key is missing! Check your gemini.env file.");
  process.exit(1); // Exit the process if the API key is not found
}
console.log("✅ API key loaded.");

// Middleware to enable Cross-Origin Resource Sharing (CORS)
// This allows your frontend (running on a different origin, e.g., file:// or a different port)
// to make requests to this backend server.
app.use(cors());

// Middleware to parse JSON request bodies
// This is necessary to read the 'message' sent from your frontend.
app.use(bodyParser.json());

// Define a POST endpoint for /gemini
// This is the endpoint your frontend will call to interact with the Gemini API.
app.post("/gemini", async (req, res) => {
  const message = req.body.message; // Extract the 'message' from the request body

  // Basic validation: Check if a message was provided
  if (!message) {
    return res.status(400).json({ response: "No message provided." });
  }

  try {
    // Make a POST request to the Google Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        // Structure the request payload as required by the Gemini API
        contents: [{ role: "user", parts: [{ text: message }] }],
      },
      {
        // Set the Content-Type header
        headers: { "Content-Type": "application/json" }
      }
    );

    // Extract the text response from the Gemini API's complex response structure
    const geminiResponse =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini."; // Fallback message if response is empty

    // Send the Gemini response back to the frontend
    res.json({ response: geminiResponse });
  } catch (error) {
    // Log detailed error information for debugging
    console.error("❌ Gemini API Error:", error.response?.data || error.message);
    // Send a generic error message to the frontend, avoiding exposing internal details
    res.status(500).json({ response: "Something went wrong. Check API key or network." });
  }
});

// Start the Express server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
