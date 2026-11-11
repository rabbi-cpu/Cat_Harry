const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://studiospace.vercel.app', // আপনার ফ্রন্টএন্ড লাইভ লিংক থাকলে এখানে দিতে পারেন
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection Setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db, studiosCollection, bookingsCollection;

async function getCollections() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'studiospace_db');
    studiosCollection = db.collection('studios');
    bookingsCollection = db.collection('bookings');
  }
  return { studiosCollection, bookingsCollection };
}

// JWT Token Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Unauthorized access: No token provided' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'studiospace_secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access: Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// ============================================
// 🚀 Public Health Check Routes
// ============================================
app.get('/', (req, res) => {
  res.send({ status: 'StudioSpace Server & Database are running smoothly! 🚀' });
});

app.get('/api', (req, res) => {
  res.send({ status: 'StudioSpace API Route Active! 🚀' });
});

// ============================================
// 🔐 Auth Routes
// ============================================
app.post('/api/jwt', async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || 'studiospace_secret_key', {
    expiresIn: '7d'
  });

  res
    .cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    })
    .send({ success: true, token });
});

app.post('/api/logout', async (req, res) => {
  res
    .clearCookie('token', {
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    })
    .send({ success: true, message: 'Logged out successfully' });
});

// ============================================
// 🌱 Seed Studios Route
// ============================================
app.get('/api/seed-studios', async (req, res) => {
  try {
    const { studiosCollection } = await getCollections();
    await studiosCollection.deleteMany({});

    const initialStudios = [
      {
        title: "Neon Pulse Production Studio",
        category: "Film",
        location: "Dhanmondi, Dhaka",
        pricePerHour: 1200,
        rating: 4.9,
        reviewsCount: 28,
        description: "A fully equipped cinematic studio with high-end RGB ambient lighting, 4K shooting equipment, soundproofing, and modular neon backdrops.",
        amenities: ["4K Camera Rigs", "RGB Nanlite Setup", "Acoustic Treatment", "High-speed Wi-Fi", "Changing Room"],
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
        hostEmail: "creator.host@studiospace.io",
        hostName: "Neon Spaces Ltd.",
        createdAt: new Date()
      },
      {
        title: "Aura Daylight Photo Loft",
        category: "Photo",
        location: "Gulshan 2, Dhaka",
        pricePerHour: 1500,
        rating: 4.8,
        reviewsCount: 35,
        description: "Minimalist industrial daylight studio with large north-facing floor-to-ceiling windows, seamless cyclorama wall, and premium strobe lighting.",
        amenities: ["Natural Sunlight", "Cyclorama Wall", "Profoto Strobes", "Makeup Station", "Air Conditioning"],
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=80",
        hostEmail: "aura.loft@studiospace.io",
        hostName: "Aura Creative Co.",
        createdAt: new Date()
      },
      {
        title: "EchoVault Acoustic Podcast Hub",
        category: "Podcast",
        location: "Banani, Dhaka",
        pricePerHour: 800,
        rating: 5.0,
        reviewsCount: 19,
        description: "Boutique sound-isolated studio optimized for multi-host audio and video podcasting with high-definition PTZ cameras and Shure SM7B microphones.",
        amenities: ["Shure SM7B Mics", "Rodecaster Pro II", "PTZ Multi-cam Setup", "Soundproof Booth", "Lounge Area"],
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
        hostEmail: "echovault@studiospace.io",
        hostName: "Echo Media Labs",
        createdAt: new Date()
      },
      {
        title: "Resonance Analog & Digital Recording Suite",
        category: "Music",
        location: "Uttara, Dhaka",
        pricePerHour: 1800,
        rating: 4.9,
        reviewsCount: 42,
        description: "Professional music production and recording suite featuring a treated live tracking room, vintage analog preamps, and an upright piano.",
        amenities: ["Upright Piano", "Universal Audio Apollo", "Genelec Monitors", "Vocal Isolation Booth", "Lounge"],
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
        hostEmail: "resonance@studiospace.io",
        hostName: "Resonance Soundworks",
        createdAt: new Date()
      },
      {
        title: "The Workshop Collective & Maker Space",
        category: "Workshop",
        location: "Mirpur DOHS, Dhaka",
        pricePerHour: 1000,
        rating: 4.7,
        reviewsCount: 15,
        description: "Spacious collaborative workshop space designed for art masterclasses, ceramics, DIY creative sessions, and design sprints.",
        amenities: ["Modular Workbenches", "Projector & Screen", "Ceramic Wheels", "Natural Ventilation", "Coffee Bar"],
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
        hostEmail: "maker@studiospace.io",
        hostName: "Collective Labs",
        createdAt: new Date()
      },
      {
        title: "Velvet Horizon Fashion & Editorial Studio",
        category: "Photo",
        location: "Mohakhali DOHS, Dhaka",
        pricePerHour: 1400,
        rating: 4.9,
        reviewsCount: 31,
        description: "High-fashion photographic studio complete with motorized backdrop rollers, blackout capabilities, and an editorial props collection.",
        amenities: ["Motorized Paper Backdrops", "Godox Continuous Lights", "Full Length Mirrors", "Steamer & Wardrobe", "Wi-Fi"],
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
        hostEmail: "velvet@studiospace.io",
        hostName: "Velvet Horizon",
        createdAt: new Date()
      }
    ];

    const result = await studiosCollection.insertMany(initialStudios);
    res.status(201).send({
      message: "Successfully seeded initial studios!",
      insertedCount: result.insertedCount
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to seed data", error: error.message });
  }
});

// ============================================
// 🎬 Studio Routes
// ============================================
app.get('/api/studios', async (req, res) => {
  try {
    const { studiosCollection } = await getCollections();
    const { category, search, sort } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    if (sort === 'price-low') {
      sortOptions.pricePerHour = 1;
    } else if (sort === 'price-high') {
      sortOptions.pricePerHour = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const studios = await studiosCollection.find(query).sort(sortOptions).toArray();
    res.send(studios);
  } catch (error) {
    res.status(500).send({ message: "Error fetching studios", error: error.message });
  }
});

app.get('/api/studios/:id', async (req, res) => {
  try {
    const { studiosCollection } = await getCollections();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const studio = await studiosCollection.findOne(query);

    if (!studio) {
      return res.status(404).send({ message: "Studio not found" });
    }

    res.send(studio);
  } catch (error) {
    res.status(500).send({ message: "Invalid Studio ID or server error", error: error.message });
  }
});

app.post('/api/studios', verifyToken, async (req, res) => {
  try {
    const { studiosCollection } = await getCollections();
    const studioData = {
      ...req.body,
      pricePerHour: Number(req.body.pricePerHour),
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date()
    };
    const result = await studiosCollection.insertOne(studioData);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to add studio", error: error.message });
  }
});

app.get('/api/my-studios', verifyToken, async (req, res) => {
  try {
    const { studiosCollection } = await getCollections();
    const email = req.query.email;
    if (!email) {
      return res.status(400).send({ message: "Host email is required" });
    }

    if (req.user.email !== email) {
      return res.status(403).send({ message: "Forbidden access" });
    }

    const query = { hostEmail: email };
    const studios = await studiosCollection.find(query).sort({ createdAt: -1 }).toArray();
    res.send(studios);
  } catch (error) {
    res.status(500).send({ message: "Error fetching user studios", error: error.message });
  }
});

app.put('/api/studios/:id', verifyToken, async (req, res) => {
  try {
    const { studiosCollection } = await getCollections();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        title: req.body.title,
        category: req.body.category,
        location: req.body.location,
        pricePerHour: Number(req.body.pricePerHour),
        description: req.body.description,
        amenities: req.body.amenities,
        image: req.body.image,
        updatedAt: new Date()
      }
    };
    const result = await studiosCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update studio", error: error.message });
  }
});

app.delete('/api/studios/:id', verifyToken, async (req, res) => {
  try {
    const { studiosCollection } = await getCollections();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await studiosCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete studio", error: error.message });
  }
});

// ============================================
// 📅 Booking Routes
// ============================================
app.post('/api/bookings', verifyToken, async (req, res) => {
  try {
    const { bookingsCollection } = await getCollections();
    const bookingData = {
      ...req.body,
      totalPrice: Number(req.body.totalPrice),
      durationHours: Number(req.body.durationHours),
      status: 'Confirmed',
      createdAt: new Date()
    };
    const result = await bookingsCollection.insertOne(bookingData);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to create booking", error: error.message });
  }
});

app.get('/api/my-bookings', verifyToken, async (req, res) => {
  try {
    const { bookingsCollection } = await getCollections();
    const email = req.query.email;
    if (!email) {
      return res.status(400).send({ message: "User email is required" });
    }

    if (req.user.email !== email) {
      return res.status(403).send({ message: "Forbidden access" });
    }

    const query = { userEmail: email };
    const bookings = await bookingsCollection.find(query).sort({ createdAt: -1 }).toArray();
    res.send(bookings);
  } catch (error) {
    res.status(500).send({ message: "Error fetching bookings", error: error.message });
  }
});

app.patch('/api/bookings/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { bookingsCollection } = await getCollections();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { status: 'Cancelled' }
    };
    const result = await bookingsCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to cancel booking", error: error.message });
  }
});

// Local Development Fallback
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running locally on http://localhost:${port}`);
  });
}

module.exports = app;