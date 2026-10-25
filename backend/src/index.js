//////////////////packages and their functions imports
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'

//library and 3rd party imports
import ConnectDb from "./lib/DbConnect.js";
import { initHealthCheckCron } from './lib/cron.js'; 

//webhook imports
import clerkWebhookHandler from './webhook/clerk.webhook.js';

///routes imports
import  testCreateUserHandler  from './routes/testRoutes.routes.js';

//////setting up packages and middlewares
dotenv.config();
const app = express();

/////////////////////////middleware for clerk webhook and other middlewares
app.use("/api/webhook",express.raw({ type: 'application/json' }),clerkWebhookHandler);
app.use(clerkMiddleware());
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));


////additional setup for serving static files in production
const publicDir = path.join(process.cwd(), "public");

/////////////////////////////////////////////routes and health check endpoint
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

app.use('/api/test', testCreateUserHandler );

////////////////////////////production build of react app in backend
//code for serving files static docker and render 
//for production build of react app in backend
// 1. Serve static files compiled by React
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

/////////////////////////////server listen and db connection
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