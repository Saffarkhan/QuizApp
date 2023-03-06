import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), "./.env") })

import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import routes from "./api/route/index.js"

const app = express();
app.use(express.json());

//routes
app.use("/api", routes)

//connect to db and listen port 4000
mongoose.set('strictQuery', false);
try{    
    mongoose.connect(process.env.MONGO_URI)
        app.listen(process.env.PORT, () => {
            console.log('Server Connected');
        })
}
catch(err){
    console.log(err.message);
}