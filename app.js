//THIS WILL BE FOR THE COMMONJS RENDERING

const express = require('express'); // CommonJS import for Express
const fs = require('fs'); // File system module
const path = require('path'); // Path module
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const ejs = require('ejs'); // Template engine



//ES RENDERING ONLY
/*
import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import ejs from 'ejs';
*/

//import PastWeather from './pastWeather.js';

//THIS IS FOR TESTING ONLY
try {
    const Greeting = require('./Greeting.js');
} catch (error) {
    console.log(error);
}

//THIS IS MOSTLY FOR TESTING PURPOSES THOUGH THE FIRST PART IS STILL IMPORTANT HERE
try {
    // COMMONJS IMPORT
    const PastWeather = require('./pastWeather.js');
    const testInstance = new PastWeather('GHCND:USC00051547');
    console.log("Test instance created successfully:", testInstance);
    
    try {
        // Instantiate the class
        const px = new PastWeather('GHCND:USC00051547'); // Pass a valid parameter
        console.log("PastWeather instance created successfully.");

        // Assuming the class has a method like `parseData`, you would call it here:
        px.parseData()
            .then((reply) => {
                console.log("Parse Data executed successfully:", reply);
            })
            .catch((error) => {
                console.error("Error during parseData execution:", error);
            });

    } catch (innerError) {
        console.error("Error initializing PastWeather instance or calling its methods:", innerError);
    }
    

} catch (error) {
    console.error('Error importing PastWeather class:', error);
}
    
  
  

//This takes the path dirname (since ES doesn't do dirnames) and instead we get the meta url
//which is our main file path, and then we get the pathname to our current app.js file here 


const app = express();


//CommonJS RENDERING
app.use(express.static(path.join(__dirname, 'public_html')));

//ES RENDERING:
//const __dirname = path.dirname(new URL(import.meta.url).pathname);


// Serve static files in "public_html" folder
app.use(express.static(path.join(__dirname, 'public_html')));


// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define route to serve the main page
app.get('/', (req, res) => {
   //ONLY FOR TESTING PURPOSES
    //res.send("ES TEST!");
    //REAL CODE HERE
    
    try {
        // Read locations data from locations.txt
        const locationsPath = path.join(__dirname, 'filteredLocations.txt');
        const locationsData = fs.readFileSync(locationsPath, 'utf-8');
        const locations = JSON.parse(locationsData); // Parse JSON data

        // Render the EJS template with the locations
        res.render('mainPage', { locations });
    } catch (error) {
        console.error("Error reading locations.txt:", error.message);
        res.status(500).send("Error loading location data.");
    }
    

});

// Define route for form submission (if needed)
app.post('/getLatandLang', async (req, res) => {

    //THIS IS ONLY FOR TESTING IF CLASSES CAN EVEN BE INSTANTIATED WITHIN POST CALLS
    try{
        const gr = new Greeting("Siddharth");
        res.send(gr.sayHello());
    } catch(error) {
        console.log(error);
    }

    /*
    try {
        // Initialize the PastWeather instance
        const testInstance = new PastWeather('GHCND:USC00261327');

        // Check if the instance is properly created
        if (testInstance) {
            res.json({
                message: "Test instance sent successfully",
                testInstance: testInstance.locationID, // Return relevant data
            });
        } else {
            throw new Error("Failed to initialize PastWeather instance.");
        }
    } catch (error) {
        console.error("Error in /getLatandLang route:", error);
        res.status(500).json({
            message: "An error occurred while processing the request.",
            error: error.message,
        });
    }
    */

        
});



// Start the server
const port = process.env.PORT || 3008;
app.listen(port, () => {
    console.log(`Node.js app listening on port ${port}`);
});