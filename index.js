const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");

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

function verfifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader) {
    return res.status(401).send('Unauthorized access');
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    // Database collections
    const carCollection = client.db("carsDatabase").collection("cars");
    const categoryCollection = client
      .db("carsDatabase")
      .collection("categories");
    const userCollection = client.db("carsDatabase").collection("users");
    const orderCollection = client.db("carsDatabase").collection("orders");

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
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get('/users', async(req, res) => {
      const type = req.query.type;
      const query = { accountType: type };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })

    app.delete('/users', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id)};
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    })

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.accountType === "admin" });
    });

    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isSeller: user?.accountType === "seller" });
    });

    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isBuyer: user?.accountType === "buyer" });
    });


    // token API
    app.get("/token", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    // orders API
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
