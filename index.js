const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// midleware
app.use(cors());
app.use(express.json());
console.log(process.env.DB_PASSWORD);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wugjgdu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// database and collection
const database = client.db("touristDB");
const userCollection = database.collection("userDB");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // test API
    app.get("/", (req, res) => {
      res.send("Server Connected Successfully");
    });

    // save new user to database
    app.post("/user", async (req, res) => {
      const userInfo = req.body;
      const query = { email: userInfo.email };
      const exist = await userCollection.findOne(query);
      if (exist) {
        return res.send({ exist: true });
      }
      console.log(exist);
      const result = await userCollection.insertOne(userInfo);
      res.send({ exist: false });
    });


    // check is Admin
    app.get("/user/admin/:email" , async (req,res)=>{
        const email = req.params.email;
        const query = {email : email};

        let admin = false;
        const user = await userCollection.findOne(query)
        if(user){
            admin = user?.role === "admin"
        }
        res.send({admin})
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server in running on PORT ${port}`);
});
