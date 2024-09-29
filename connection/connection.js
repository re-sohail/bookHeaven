const mongoose = require("mongoose")
// require('dotenv').config()

const connection = async()=>{
    try {
        await mongoose.connect(`${process.env.URI}`)
        console.log("Database connected Successfully");
        
    } catch (error) {
        console.log(error)
    }
}
connection()