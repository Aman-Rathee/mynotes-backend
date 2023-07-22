const mongoose = require('mongoose')
const mongoUri = 'mongodb://127.0.0.1:27017/mynotes?'
mongoose.set('strictQuery', true);



const connectToMongo = ()=>{
    mongoose.connect(mongoUri,()=> {
        console.log('Connected to mongo sucesfully');
    })
}

module.exports = connectToMongo;