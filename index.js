const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// midleware
app.use(
  cors({
    origin: ["https://assignment-12-819b8.web.app", "http://localhost:5173"],
  })
);
app.use(express.json());
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
const packagesCollection = database.collection("tourPackages");
const bookingCollection = database.collection("bookingDB");
const wishCollection = database.collection("wishListCollection");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // test API
    app.get("/", async (req, res) => {
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
      const result = await userCollection.insertOne(userInfo);
      res.send({ exist: false });
    });

    // get all user
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // check is Admin
    app.get("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      let admin = false;
      const user = await userCollection.findOne(query);
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    // api for make admin

    app.patch("/user/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // api for make guide

    app.patch("/user/guide/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "guide",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });


    // api for accept booking
    app.patch("/booking/accept/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            status: "accepted",
          },
        };
        const result = await bookingCollection.updateOne(filter, updatedDoc);
        res.send(result);
      });


    //   api for reject booking
    app.patch("/booking/reject/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            status: "rejected",
          },
        };
        const result = await bookingCollection.updateOne(filter, updatedDoc);
        res.send(result);
      });

    // add package api

    app.post("/package", async (req, res) => {
      const data = req.body;
      const result = await packagesCollection.insertOne(data);
      res.send(result);
    });

    // Api for get all packages
    app.get("/packages", async (req, res) => {
      const result = await packagesCollection.find().toArray();
      res.send(result);
    });

    // api for get last 3 packages
    app.get("/packages/last", async (req, res) => {
      const result = await packagesCollection.find().limit(3).toArray();
      res.send(result);
    });

    // api for getting specific package
    app.get("/package/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await packagesCollection.findOne(query);
      res.send(result);
    });

    // api for loading guides
    app.get("/guides", async (req, res) => {
      const query = { role: "guide" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    // api for loading specific guide
    app.get("/guide/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // api for booking packages
    app.post("/booking", async (req, res) => {
      const data = req.body;
      const result = await bookingCollection.insertOne(data);
      res.send(result);
    });

    // Api for get my bookings
    app.get("/my-bookings", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    // api for delete my booking
    app.delete("/my-booking/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    // api for creating wishList
    app.post("/wish-list", async (req, res) => {
      const data = req.body;
      const result = await wishCollection.insertOne(data);
      res.send(result);
    });

    //api for get all wishlist
    app.get("/wish-lists", async (req, res) => {
        
    });



    // api for get my asiigned tours
    app.get("/assigned-tours",async(req,res)=>{
        const email = req.query.email;
        const query ={ guideEmail : email }
        const result = await bookingCollection.find(query).toArray()
        res.send(result)
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
