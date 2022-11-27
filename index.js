const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tyocyp7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // Database collections
    const carCollection = client.db("carsDatabase").collection("cars");
    const categoryCollection = client.db("carsDatabase").collection("categories");
    const userCollection = client.db("carsDatabase").collection("users");

    // API routes
    // categories API
    app.get("/categories", async (req, res) => {
      const filter = {};
      const result = await categoryCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/categories/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const result = await categoryCollection.findOne(query);
      res.send(result);
    });

    // cars API
    app.get("/cars", async (req, res) => {
        const category = req.query.category;
        const query = { category: category };
        const cars = await carCollection.find(query).toArray();
        res.send(cars);
      });

    // users API
    // token API
    app.get('/token', async(req, res) => {
      const email = req.query.email;
      const query = { email: email};
      const user = await userCollection.findOne(query);
      if(user) {
        const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '2h'});
        res.send({accessToken: token});
      }
      res.status(403).send({accessToken: ''});
    })

    app.post('/users', async(req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.get('/users', async(req, res) => {
      const filter = {};
      const result = await userCollection.find(filter).toArray();
      res.send(result);
    })

  } 
  
  finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`servcer is running on ${port}`);
});
