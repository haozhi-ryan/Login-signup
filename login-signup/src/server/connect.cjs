// Import MongoDB client
const { MongoClient, ServerApiVersion } = require('mongodb');

// Dotenv
require("dotenv").config({path: "./config.env"}) // Load environment variables from .env file

// Express
const express = require("express"); // Import Express for creating the server
const app = express() // Initialize Express

// CORS
const cors = require("cors"); // Import CORS to allow cross-origin requests
app.use(cors()); // Enable CORS (allows frontend requests)
app.use(express.json()); // Parse incoming JSON requests

// Get MongoDB URI from environment variables
const uri = process.env.ATLAS_URI 
if (!uri) {
    console.error("Error: Missing ATLAS_URI in environment variables.");
    process.exit(1); // Exit if the URI is missing
}

// Create a new MongoDB client with specific settings
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

// Function to connect to MongoDB and set up API routes
async function connectToMongoDB() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        console.log("You successfully connected to MongoDB!");

        // Select the database and collection
        const database = client.db("sample_mflix"); // Replace with your actual database name
        const moviesCollection = database.collection("movies"); // Replace with your actual collection name

        // **GET endpoint: Fetch movies from MongoDB**
        app.get("/movies", async (req, res) => {
            try {
                // Fetch up to 10 movies from the collection
                const movies = await moviesCollection.find().limit(10).toArray();
                res.json(movies); // Send movies as JSON response
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch movies" });
            }
        });

        // **POST endpoint: Store a new movie in MongoDB**
        app.post("/movies", async (req, res) => {
            try {
                const newMovie = req.body; // Get movie data from the request body

                // Validate input
                if (!newMovie || !newMovie.title) {
                    return res.status(400).json({ error: "Movie title is required" });
                }

                // Insert movie into MongoDB
                const result = await moviesCollection.insertOne(newMovie);
                console.log("Inserted Movie:", result);
                
                // Respond with success message
                res.status(201).json({ message: "Movie added successfully", data: result });
            } catch (error) {
                console.error("Error inserting movie:", error); // Log the actual error
                res.status(500).json({ error: "Failed to add movie" });
            }
        });

        } catch (e) {
            console.error("MongoDB connection error:", e);
        } 

}

connectToMongoDB(); // Call the function to connect to MongoDB

// Define the server port (default: 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

