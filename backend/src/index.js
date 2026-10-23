import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";

import ConnectDb from "./lib/DbConnect.js";
import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'

dotenv.config();

const app = express();


app.use(clerkMiddleware());
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));


//code for serving files static docker and render 
// 1. Serve static files compiled by React
if (fs.existsSync(publicDir)) {
app.use(express.static(path.join(publicDir, '../public')));
}
// API routes go here (e.g., app.use('/api/messages', messageRoutes))
// 2. Fallback route: Send index.html for non-API requests (React Router support)
app.get('*', (req, res,next) => {
  res.sendFile(path.join(publicDir, '../public/index.html'));
});



app.get("/",(req,res)=>{
    res.status(201).send("Hello from backend");
}
); 

app.get("/health",(req,res)=>{
    res.status(200).json({status:"ok",header:req.headers})
});

app.listen(process.env.PORT || 3000,async ()=>{
    try{
        await ConnectDb();
    }catch(err){
        console.log(err);
        process.exit(1);
    }
});