const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.7ky8m.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const userCollection = client.db("bookify").collection("users");
    const hotelCollection = client.db("bookify").collection("hotels");
    const roomCollection = client.db("bookify").collection("rooms");
    const bookingCollection = client.db("bookify").collection("bookings");

    // Add Users
    app.post("/addUsers", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log(user);
      res.send(result);
    });

    // Get All Users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });

    // Add Hotels
    app.post("/addHotels", async (req, res) => {
      const hotels = req.body;
      const result = await hotelCollection.insertOne(hotels);
      res.send(result);
    });

    // Get all Hotels
    app.get("/hotels", async (req, res) => {
      const query = {};
      const hotels = await hotelCollection.find(query).toArray();
      res.send(hotels);
    });

    // get hotels name , address, and id
    app.get("/hotelName", async (req, res) => {
      const hotelName = await hotelCollection
        .find({})
        .project({ hotelName: 1, address: 1, upazila: 1 })
        .toArray();

      res.send(hotelName);
    });

    // get hotels info by id
    app.get("/hotels/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const hotel = await hotelCollection.find(query).toArray();
      res.send(hotel);
    });

    // Add rooms
    app.post("/addRooms", async (req, res) => {
      const rooms = req.body;
      const result = await roomCollection.insertOne(rooms);
      res.send(result);
    });

    // Get all rooms
    app.get("/rooms", async (req, res) => {
      const query = {};
      const rooms = await roomCollection.find(query).toArray();
      res.send(rooms);
    });

    // Get 4 luxurias rooms
    app.get("/luxuriasRooms", async (req, res) => {
      const query = {};
      const allRooms = await roomCollection.find(query).toArray();
      const rooms = allRooms
        .sort((a, b) => b.rackRate - a.rackRate)
        .slice(0, 5);
      res.send(rooms);
    });

    // get rooms by hotel Id
    app.get("/room/:id", async (req, res) => {
      const id = req.params.id;
      const query = { hotleId: id };
      const room = await roomCollection.find(query).toArray();
      res.send(room);
    });

    // get rooms by room Id
    app.get("/editRoom/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const room = await roomCollection.find(query).toArray();
      res.send(room[0]);
    });

    app.put("/updateRoom/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const {
        complimentary,
        discount,
        facilities,
        maxGuest,
        rackRate,
        roomName,
        totalRoom,
      } = req.body;
      const option = { upsert: true };
      const updateRoom = {
        $set: {
          complimentary,
          discount,
          facilities,
          maxGuest,
          rackRate,
          roomName,
          totalRoom,
        },
      };
      const result = await roomCollection.updateOne(query, updateRoom, option);
      res.send(result);
    });

    // get rooms price, id, discount
    app.get("/roomPrice", async (req, res) => {
      const allRoom = await roomCollection
        .find({})
        .project({ hotleId: 1, rackRate: 1, discount: 1 })
        .toArray();

      const cheapestHotels = allRoom
        .sort((a, b) => a.rackRate - b.rackRate)
        .filter((obj, index, self) => {
          return index === self.findIndex((t) => t.hotleId === obj.hotleId);
        });

      res.send(cheapestHotels);
    });

    // adding booking info
    app.post("/addBooking", async (req, res) => {
      const booking = req.body;
      const addBooking = await bookingCollection.insertOne(booking);
      res.send(addBooking);
    });

    // get all booking info
    app.get("/allBooking", async (req, res) => {
      const query = {};
      const allBooking = await bookingCollection.find(query).toArray();
      res.send(allBooking);
    });

    // get user booking info
    app.get("/myBooking", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { userEmail: req.query.email };
      }
      const myBooking = await bookingCollection.find(query).toArray();
      res.send(myBooking);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", async (req, res) => {
  res.send("Welcome to Bookify Server!!!");
});

app.listen(port, () => {
  console.log("listening from ", port, " port");
});
