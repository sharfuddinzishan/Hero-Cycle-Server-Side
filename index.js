const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
var admin = require("firebase-admin");
// Middleware
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x4ckn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Firebase Admin Service Account
var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Middleware Verify Token
async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodeUser = await admin.auth().verifyIdToken(idToken);
            req.decodedUserMail = decodeUser.email;
        }
        catch {

        }
    }
    next();
}

const herocycle = async () => {
    try {
        await client.connect();
        const usersCollection = client.db('herocycle').collection('users');
        const cyclesCollection = client.db('herocycle').collection('cycles');

        // Check Server is Ok or Not
        app.get('/', (req, res) => {
            res.send('Welcome Hero Cycle App');
        })

        // Add New User
        app.post('/users', async (req, res) => {
            const userInfo = req.body
            const result = await usersCollection.insertOne(userInfo);
            res.send(result);
        })

        // Check user is exist or not
        app.get('/user', async (req, res) => {
            const email = req.query.email
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send(user);
        })

        // Check user is admin or not
        app.get('/user/admin', async (req, res) => {
            const email = req.query.email
            let isAdmin = false
            const query = { email }
            const user = await usersCollection.findOne(query);
            if (user?.role === 'admin')
                isAdmin = true
            res.send(isAdmin);
        })

        // //Make Admin
        // app.put('/user/admin', verifyToken, async (req, res) => {
        //     const user = req.body
        //     const getDecodeEmail = req.decodedUserMail;
        //     if (getDecodeEmail) {
        //         const findUser = { email: getDecodeEmail }
        //         const getUser = await usersCollection.findOne(findUser);
        //         if (getUser?.role === 'admin') {
        //             const filter = { email: user.email }
        //             const updateDoc = {
        //                 $set: {
        //                     role: 'admin'
        //                 }
        //             }
        //             const result = await usersCollection.updateOne(filter, updateDoc)
        //             res.send(result)
        //         }
        //         else {
        //             res.send({ status: 401 })
        //         }
        //     }
        //     else {
        //         res.send({ status: 401 })
        //     }
        // })

        // /******************************************************* */
        // // Post New Cycle 
        // app.post('/cycle', verifyToken, async (req, res) => {
        //     const getSingleCycle = req.body
        //     const getDecodeEmail = req.decodedUserMail;
        //     if (getDecodeEmail) {
        //         const findUser = { email: getDecodeEmail }
        //         const getUser = await usersCollection.findOne(findUser);
        //         if (getUser?.role === 'admin') {
        //             const result = await cyclesCollection.insertOne(getSingleCycle);
        //             res.send(result);
        //         }
        //         else {
        //             res.send({ status: 401 })
        //         }
        //     }
        //     else {
        //         res.send({ status: 401 })
        //     }
        // })

        // // Update Cycle 
        // app.put('/cycle', verifyToken, async (req, res) => {
        //     const getSingleCycle = req.body
        //     const getDecodeEmail = req.decodedUserMail;
        //     if (getDecodeEmail) {
        //         const findUser = { email: getDecodeEmail }
        //         const getUser = await usersCollection.findOne(findUser);
        //         if (getUser?.role === 'admin') {
        //             const filter = { _id: ObjectId(getSingleCycle._id) }
        //             const updateDoc = {
        //                 $set: {
        //                     model: getSingleCycle.model,
        //                     price: getSingleCycle.price,
        //                     frameSize: getSingleCycle.frameSize,
        //                     weight: getSingleCycle.weight,
        //                     material: getSingleCycle.material,
        //                     preferAge: getSingleCycle.preferAge,
        //                     gender: getSingleCycle.gender,
        //                     category: getSingleCycle.category,
        //                     picture: getSingleCycle.picture,
        //                     overview: getSingleCycle.overview
        //                 }
        //             }
        //             const result = await cyclesCollection.updateOne(filter, updateDoc)
        //             res.send(result)
        //         }
        //         else {
        //             res.send({ status: 401 })
        //         }
        //     }
        //     else {
        //         res.send({ status: 401 })
        //     }
        // })

        // Get All Cycles for Admin 
        app.get('/cycles', async (req, res) => {
            const result = await cyclesCollection.find({}).toArray();
            res.send(result);
        })

        // Get Single Cycle by CycleID
        app.get('/cycles/:cycleID', async (req, res) => {
            const getCycleID = req.params.cycleID
            const query = { _id: ObjectId(getCycleID) }
            const cycle = await cyclesCollection.findOne(query);
            res.send(cycle);
        })

    }

    finally {
    }
}

herocycle().catch(() => console.dir());
app.listen(PORT, () => console.log('Connect Hero Cycle'));