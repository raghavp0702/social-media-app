const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const auth = require('./controllers/Authentication');
const users = require('./controllers/users');
const following = require('./controllers/users');
const app = express();

app.use(cors());

app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(
    console.log("Connected to MongoDB")
).catch( (err) => { console.log(err) });

app.use("/api/authenticate", auth);
app.use("/api/", users);
app.use("/api/post", users);


const PORT = process.env.PORT || 5000;


app.get('/', function (req, res) {
    res.send('Hello World!');
  });

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

