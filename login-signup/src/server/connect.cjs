const bcrypt = require("bcrypt"); // Import bcrypt library for securely hashing passwords

// MongoDB: Connects to MongoDB.
const { MongoClient, ServerApiVersion } = require('mongodb');

// Dotenv: Loads MongoDB connection details from a .env fil
require("dotenv").config({path: "./config.env"}) // Load environment variables from .env file

// Express: Creates the backend server.
const express = require("express"); // Import Express for creating the server
const app = express() // Initialize Express

// CORS: Allows requests from different origins (like frontend apps).
const cors = require("cors"); // Import CORS to allow cross-origin requests
app.use(cors()); // Enable CORS (Allows frontend apps (like React) to make API requests.)
app.use(express.json()); // Allows the server to accept JSON data in requests

// Get MongoDB URI from environment variables
const uri = process.env.ATLAS_URI 

// Checks if the MongoDB connection string is valid
if (!uri) {
    console.error("Error: Missing ATLAS_URI in environment variables.");
    process.exit(1); // Exit if the URI is missing
}

// Create a new MongoDB client with specific settings
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1, // Uses MongoDB Server API v1, ensuring compatibility with MongoDB 5.0+.
      strict: true, // Enables strict mode, which makes the driver reject unknown commands instead of issuing warnings.
      deprecationErrors: true, // Makes the driver throw errors for deprecated features, helping with future-proofing your code.
    }
  });

// Function to connect to MongoDB and set up API routes
async function connectToMongoDB() {
    try {
        // Connect the client to the server	and logs success
        console.log("You successfully connected to MongoDB!");

        // Select the database and collection
        const database = client.db("sample_mflix"); // Replace with your actual database name
        const usersCollection = database.collection("users"); // Replace with your actual collection name

        // **GET endpoint: Fetch users from MongoDB**
        app.get("/users", async (req, res) => {
            try {
                // Fetch up to 10 movies from the collection
                const users = await usersCollection.find().limit(10).toArray();
                res.json(users); // Send movies as JSON response
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch movies" });
            }
        });

        // **POST endpoint: Store a new user in MongoDB**
        // A POST API endpoint allows a client (like a React app) to send data to the backend server, which then processes and stores it in a database.
        app.post("/users", async (req, res) => {
            // The req object contains information about the HTTP request sent by the client (frontend, Postman, browser, etc.).
            // The res object sends back a response to the client.
            try {
                const { name, email, password } = req.body;
                // Validate input
                if (!name || !email || !password) {
                    return res.status(400).json({ error: "Please fill in all fields" });
                }
                
                // **Check if email already exists in the database**
                const existingUser = await usersCollection.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ error: "Email already exists. Please use a different email." });
                }

                // **Hash the password before storing it**
                const saltRounds = 10; // Recommended salt rounds
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                // Insert user into MongoDB
                const result = await usersCollection.insertOne({ name, email, password: hashedPassword });
                console.log("Inserted User:", result);
                
                // Respond with success message
                res.status(201).json({ message: "User added successfully", data: result });
            } catch (error) {
                console.error("Error inserting User:", error); // Log the actual error
                res.status(500).json({ error: "Failed to add user" });
            }
        });

        // POST route for login and checking for credentials
        app.post("/users/login", async (req, res) => {
            try {
                const { email, password } = req.body;
        
                // Validate input
                if (!email || !password) {
                    return res.status(400).json({ message: "Email and password are required" });
                }
        
                // Find user in the "users" collection
                const user = await usersCollection.findOne({ email });
        
                if (!user) {
                    return res.status(400).json({ message: "Invalid email or password" });
                }
        
                // Compare entered password with stored hashed password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(400).json({ message: "Invalid email or password" });
                }
        
                // Login successful
                res.json({ message: "Login successful!", user: { name: user.name, email: user.email } });
        
            } catch (error) {
                console.error("Error logging in:", error);
                res.status(500).json({ error: "Server error, try again later" });
            }
        });
        
        } catch (e) {
            console.error("MongoDB connection error:", e);
        } 

}

connectToMongoDB(); // Call the function to connect to MongoDB

// Start the server on a specific server port (default: 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

