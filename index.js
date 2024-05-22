const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected  MongoDB");
        const db = client.db('traditional');
        const taskCollection = db.collection('products');
        
        app.get('/products', async (req, res) => {
            const { category } = req.query;
            console.log(category);
            
            try {
                let query = {};
                if (category) {
                    query.category = category; // No need to convert to lowercase since MongoDB queries are case-sensitive by default
                }
        
                const products = await taskCollection.find(query).toArray();
                console.log(products);
        
                res.status(200).json({ status: true, data: products });
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).json({ message: 'Server Error' });
            }
        });
        
        
        
        app.get('/product/:id', async (req, res) => {
            const productId = req.params.id;
        
            try {
                const product = await taskCollection.findOne({ _id:new ObjectId(productId) });
        
                if (!product) {
                    return res.status(404).send("Product not found");
                }
        
                res.send(product);
            } catch (error) {
                console.error("Error retrieving product:", error);
                res.status(500).send("Internal Server Error");
            }
        });
        

        app.get('/all-products', async (req, res) => {
          
          const cursor = taskCollection.find();
          const tasks = await cursor.toArray();
          res.send({ status: true, data: tasks });
        });
    
        app.post('/product', async (req, res) => {
          const task = req.body;
        
          const result = await taskCollection.insertOne(task);
          res.send(result);
        });

        // ==============================================================
        // WRITE YOUR CODE HERE
        // ==============================================================


        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } finally {
    }
}

run().catch(console.dir);

// Test route
app.get('/', (req, res) => {
    const serverStatus = {
        message: 'Server is running',
        timestamp: new Date()
    };
    res.json(serverStatus);
});