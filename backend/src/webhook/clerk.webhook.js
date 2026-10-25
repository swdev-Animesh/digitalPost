import clerkWebhookHandler from '../controller/clerkWebhook.controller.js';
import express from 'express';

const router=express.Router();

router.post("/clerk",clerkWebhookHandler);
