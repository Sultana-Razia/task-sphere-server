const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();



const port = process.env.PORT || 5000;

const app = express();



const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true,
    optionSuccessStatus: 200,
}

//middleware
app.use(cors(corsOptions));
app.use(express.json());


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qtkz8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.qtkz8.mongodb.net:27017,cluster0-shard-00-01.qtkz8.mongodb.net:27017,cluster0-shard-00-02.qtkz8.mongodb.net:27017/?ssl=true&replicaSet=atlas-64o5c2-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const jobsCollection = client.db('taskSphere').collection('jobs');
        const bidsCollection = client.db('taskSphere').collection('bids');

        //Get all jobs data from db
        app.get('/jobs', async (req, res) => {
            const result = await jobsCollection.find().toArray();

            res.send(result);
        })

        //Get a single job data from database using job id
        app.get('/job/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result);
        })

        //Save a bid data in database
        app.post('/bid', async (req, res) => {
            const bidData = req.body;
            // console.log(bidData);
            const result = await bidsCollection.insertOne(bidData);
            res.send(result);
        })

        //Save a job data in database
        app.post('/job', async (req, res) => {
            const jobData = req.body;
            const result = await jobsCollection.insertOne(jobData);
            res.send(result);
        })

        //Get all jobs posted by a specific user
        app.get('/jobs/:email', async (req, res) => {
            const email = req.params.email;
            const query = { 'buyer.email': email };
            const result = await jobsCollection.find(query).toArray();
            res.send(result);
        })

        //Delete a job data from database
        app.delete('/job/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from taskSphere server.......');
})

app.listen(port, () => console.log(`Server running on port ${port}`))