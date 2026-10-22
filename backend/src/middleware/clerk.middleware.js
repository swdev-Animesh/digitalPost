import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'


export const  clerkAuthMiddlewareProtect = async (req, res, next) => {    
     // Use `getAuth()` to get the user's `userId` and authentication status
  const { isAuthenticated, userId } = getAuth(req)

  // If user isn't authenticated, return a 401 error
  if (!isAuthenticated) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  req.user = user
  next()
}

