import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";

import ConnectDb from "./lib/DbConnect.js";
import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'

import { initHealthCheckCron } from './lib/cron.js'; 

dotenv.config();

const app = express();

const publicDir = path.join(process.cwd(), "public");

app.use(clerkMiddleware());
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));






// app.get("/",(req,res)=>{
//     res.status(201).send("Hello from backend");
// }
// ); 

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is healthy and running smoothly",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // seconds the server has been running
    environment: process.env.NODE_ENV 
  });
});
//code for serving files static docker and render 
// 1. Serve static files compiled by React
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

app.listen(process.env.PORT || 3000,async ()=>{
    try{
        await ConnectDb();
         if(process.env.NODE_ENV === 'production'){
            const serverUrl = process.env.FRONTEND_URL;
                 initHealthCheckCron(serverUrl);
        }  
    }catch(err){
        console.log(err);
        process.exit(1);
    }
});