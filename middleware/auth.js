const jwt = require('jsonwebtoken');
// require is a built-in Node.js function that imports external modules
// 'jsonwebtoken' is the library we installed that handles creating and verifying JWT tokens

const tokenBlacklist = new Set();
// Creates an empty Set (a collection of unique values) to store blacklisted/revoked tokens
// This is used in the bonus challenge for the logout feature

function authenticateToken(req, res, next) {
  // This is a middleware function - it runs between when Express receives a request and when it sends a response
  // req = the incoming request object (contains headers, body, etc.)
  // res = the response object we use to send data back to the client
  // next = a function that passes control to the next middleware or route handler

  const authHeader = req.headers['authorization'];
  // req.headers contains all the HTTP headers sent by the client
  // 'authorization' header is where the client sends the token (if they have one)
  // We access it with bracket notation because 'authorization' has a hyphen

  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  // This checks two things at once using the && and ternary operators:
  // 1. Does authHeader exist (not null/undefined)?
  // 2. Does it start with "Bearer "?
  // If both conditions are true: split the header by space and take the second part [1] (the actual token)
  // If either condition is false: set token to null
  // Example: "Bearer abc123" -> split(' ') gives ["Bearer", "abc123"] -> [1] gives "abc123"

  if (!token) {
    // The ! (NOT operator) checks if token is falsy (null, undefined, empty string)
    // If no token was found in the header, send back a 401 Unauthorized response

    return res.status(401).json({ error: 'Access denied. No token provided.' });
    // res.status(401) sets the HTTP status code to 401 (Unauthorized)
    // .json() sends a JSON-formatted response back to the client
    // The return keyword stops execution of the rest of this function
  }

  if (tokenBlacklist.has(token)) {
    // .has() checks if the Set contains this specific token string
    // If the token was blacklisted (user logged out), reject it

    return res.status(401).json({ error: 'Token has been revoked.' });
    // Send a 401 response indicating the token was revoked during logout
  }

  try {
    // try/catch is used to handle errors that might occur during execution
    // If the code inside try throws an error, execution jumps to the catch block

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // jwt.verify() is the function that checks if a token is valid
    // It takes three arguments: the token string, the secret key, and optional options
    // process.env.JWT_SECRET reads the JWT_SECRET variable from our .env file
    // If the token is valid: it returns the decoded payload (the data inside the token)
    // If the token has expired: it throws a TokenExpiredError
    // If the token was tampered: it throws a JsonWebTokenError

    req.user = decoded;
    // We attach the decoded payload (userId, email, role) to the req object
    // This makes the user data available to all subsequent route handlers
    // For example, later we can access req.user.userId to get the user's ID

    next();
    // next() passes control to the next middleware function or the actual route handler
    // Without calling next(), the request would hang forever and never get a response

  } catch (error) {
    // If any error is thrown inside the try block, we end up here
    // error is an object containing information about what went wrong

    if (error.name === 'TokenExpiredError') {
      // TokenExpiredError is a specific error thrown by jwt.verify() when the token has expired
      // error.name contains the type/name of the error

      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
      // Send a clear message telling the user their token expired
    }

    return res.status(401).json({ error: 'Invalid token.' });
    // If the error is NOT a TokenExpiredError (e.g., tampered token, wrong format)
    // Send a generic "Invalid token" message
    // This covers JsonWebTokenError, NotBeforeError, and any other JWT errors
  }
}

module.exports = { authenticateToken, tokenBlacklist };
// module.exports is how we make functions/variables available to other files
// Other files can import these using: const { authenticateToken } = require('./middleware/auth')
// We export both the middleware function and the blacklist Set so server.js can use them
