const connectToMongo = require('./db')
const express = require('express')
const cors = require('cors')



connectToMongo();
const app = express()
const port = 5000

app.use(express.json())
app.use(cors())

// Available Routes
app.use('/api/auth', require('./routes/auth')) 
app.use('/api/notes', require('./routes/notes')) 

app.listen(port, () => {
  console.log(`MyNotes backend app listening on port http://localhost:${port}`)
})









// const express = require('express');
// const { default: mongoose } = require('mongoose');
// const app = express()
// const  mongoDB ="mongodb://127.0.0.1:27017/amandb"
// mongoose.set('strictQuery', true);

// mongoose.connect(mongoDB,(err)=>{
//     if(err) console.log(`Unable to connect to the server : ${err}`);
//     else
//     console.log("Mongodb is connected");
// })

// app.listen(5000, ()=>{
//     console.log("Server is running onn port : 5000");
// })


// node --trace-deprecation ...


