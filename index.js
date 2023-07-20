const express = require('express');
const app = express();
const cors = require('cors');
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
require('dotenv').config();

const port = process.env.Port || 5000;


//middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.voqisr3.mongodb.net/?retryWrites=true&w=majority`;

// offline
// const uri = 'mongodb://localhost:27017';

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

        // collections
        const userCollection = client.db('web-chat-app-DB').collection('users');
        const messageCollection = client.db('web-chat-app-DB').collection('messages');
        const conversationCollection = client.db('web-chat-app-DB').collection('conversations');


        // user created
        app.post('/users', async (req, res) => {
            const user = req.body;

            const query = {
                email: user.email
            };
            const existUser = await userCollection.findOne(query);
            if (existUser) {
                return res.send({
                    message: 'user already exists'
                })
            }

            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        // users api
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        // messages created
        app.post('/messages', async (req, res) => {
            const newMessage = req.body;
            // console.log(newMessage)
            const result = await messageCollection.insertOne(newMessage);
            res.send(result);
        })

        // // messages api
        app.get('/messages', async (req, res) => {

            let query = {}

            if (req.query.senderEmail || req.query.receiverEmail) {
                query = {
                    senderEmail: req.query.senderEmail,

                }
            }

            const result = await messageCollection.find(query).toArray();
            // console.log(result)
            res.send(result);
        })

        // conversations created
        app.post('/conversations', async (req, res) => {
            const newConversation = req.body;

            const query = {
                senderEmail: newConversation.senderEmail,
                receiverEmail: newConversation.receiverEmail,
            };

            // console.log('query', query)
            const exist = await conversationCollection.findOne(query);
            if (exist) {
                return res.send({
                    message: 'conversation already exists'
                })
            }

            // console.log(newConversation)
            const result = await conversationCollection.insertOne(newConversation);
            res.send(result);
        })

        // conversations api
        app.get('/conversations', async (req, res) => {
            // const newConversation = req.body;

            // console.log(newConversation)
            const result = await conversationCollection.find().toArray();
            res.send(result);
        })

        // conversaion delete
        app.delete('/conversation-delete/:id', async (req, res) => {
            // console.log(req.params.id)
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            // msg delete
            const msgDelete = await messageCollection.deleteMany({
                conversationId: id
            });
            // conversation delete
            const result = await conversationCollection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({
        //     ping: 1
        // });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('web chat server is running')
})


app.listen(port, () => {
    console.log(`web chat port is ${port}`);
});
