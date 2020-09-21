// IMPORTING
import express from 'express'; //error // use node server.js instead of nodemon server.js in terminal
import mongoose from 'mongoose';
import Messages from './dbMessages';
import Pusher from "pusher";
import cors from 'cors';

//**********APP CONFIGURATION
//create instance
const app = express();

// create port
const port = process.env.PORT || 9000;

//Signup to pusher.com to enable realtime update
const pusher = new Pusher({
    appId: '1076579',
    key: 'de3356ceabaa4d001979',
    secret: 'cc177c04475d4d5bc2d0',
    cluster: 'eu',
    encrypted: true
  });

// **************MIDDLEWARE*************
app.use(express.json());
app.use(cors())

// // For security
// app.use((req,res,next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-control-Allow-Headers", "*");
//     next();
// })

// ***************DB CONFIG
const connection_url = 'mongodb+srv://admin:VXrsnREuxAUK50fV@cluster0.f7drt.mongodb.net/whatsappdb?retryWrites=true&w=majority';
mongoose.connect(connection_url, {
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology: true    
})

const db = mongoose.connection

db.once("open", () => {
    console.log("Db is connected"); 

    const msgCollection =db.collection('messagecontents');
    // console.log(msgCollection); //TODO: remove this

    const changeStream = msgCollection.watch();

    
    changeStream.on("change", (change) => {
        // console.log(change);
        console.log("A change occured", change); //TODO: Remove this
    
        if(change.operationType ==="insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',{
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            });
        }else{
            console.log("Error triggering Pusher");
        }
    })

});



// API ROUTES
app.get("/", (req,res)=> res.status(200).send("hello world xx"));

//Api to get data from mongoDb
app.get('/messages/sync', (req,res) => {
    Messages.find((err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

//Route to post messages to MongoDb
app.post('/messages/new', (req,res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err,data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
    
})

// LISTEN
app.listen(port,() => console.log('Server is listening on port ' + port));