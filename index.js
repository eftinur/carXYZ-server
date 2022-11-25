const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// DB_USER=carCarriageAdmin
// DB_PASS=wzkn745EiP1uqawy

// MongoDb

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tyocyp7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const carCollection = client.db("carsDatabase").collection("cars");
    const categoryCollection = client
      .db("carsDatabase")
      .collection("categories");

    app.get("/categories", async (req, res) => {
      const filter = {};
      const result = await categoryCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/categories/:category", async (req, res) => {
      const category = req.params.category;
      console.log(category);
      const query = { category: category };
      const result = await categoryCollection.findOne(query);
      res.send(result);
    });

    app.get("/cars", async (req, res) => {
        const category = req.query.category;
        const query = { category: category };
        const cars = await carCollection.find(query).toArray();
        res.send(cars);
      });


    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await carCollection.findOne(filter);
      res.send(result);
    });

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
