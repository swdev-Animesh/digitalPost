import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";


import {ConnectDb,disconnectFromMongoDB } from "./lib/DbConnect.js";
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
app.use(express.static(path.join(__dirname, '../public')));
// API routes go here (e.g., app.use('/api/messages', messageRoutes))
// 2. Fallback route: Send index.html for non-API requests (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
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
        await disconnectFromMongoDB();
        process.exit(1);
    }
});