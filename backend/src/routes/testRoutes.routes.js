import express from 'express';
import { testCreateUserHandler } from '../controllers/testUser.controller.js';

const router = express.Router();

router.get('/create-test-user', testCreateUserHandler);

export default router;