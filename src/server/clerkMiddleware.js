import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

const clerkAuthMiddleware = ClerkExpressWithAuth({
  apiKey: process.env.CLERK_API_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
});

export default clerkAuthMiddleware;
