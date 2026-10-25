import express from 'express';
import { testCreateUserHandler } from '../controller/testUser.controller.js';

const router = express.Router();

router.get('/create-test-user', testCreateUserHandler);

export default router;