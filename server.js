const express = require('express');
// Import the express library so we can create a web server
// express is a popular Node.js framework for building web applications and APIs

const jwt = require('jsonwebtoken');
// Import jsonwebtoken library for creating and verifying JWT tokens
// JWT (JSON Web Token) is a secure way to transmit data between client and server

const bcrypt = require('bcryptjs');
// Import bcryptjs for hashing and comparing passwords
// bcryptjs is a library that securely encrypts passwords so we never store plain text passwords

const dotenv = require('dotenv');
// Import dotenv to load environment variables from the .env file
// Environment variables keep sensitive data (like secret keys) out of our code

dotenv.config();
// Call dotenv's config() function to load the .env file
// After this, we can access variables using process.env.VARIABLE_NAME

const { authenticateToken, tokenBlacklist } = require('./middleware/auth');
// Import the authenticateToken middleware and tokenBlacklist Set from our auth.js file
// The curly braces { } are for "named exports" - importing specific items from the module

const app = express();
// Create our Express application by calling express() as a function
// The app object is the main hub for setting up routes and starting the server

const PORT = process.env.PORT || 3000;
// Set the port number: use PORT from .env file if available, otherwise default to 3000
// The || operator means "use the first truthy value" - if process.env.PORT exists, use it; if not, use 3000

app.use(express.json());
// app.use() tells Express to use a middleware function for ALL incoming requests
// express.json() is built-in middleware that parses incoming JSON request bodies
// Without this, req.body would be undefined when clients send JSON data

const users = [];
// Create an empty array to store user data in memory
// This is a simple approach for learning - in production, you'd use a database
// Each user object will look like: { id, name, email, password (hashed) }

let userIdCounter = 1;
// A counter to generate unique IDs for each new user
// We increment this every time a new user registers

function generateToken(user) {
  // This function creates (signs) a JWT token for a given user
  // A JWT token contains encoded data (payload) that the server can trust because it's signed

  return jwt.sign(
    // jwt.sign() is the function that creates a signed JWT token
    // It returns a string (the token)

    { userId: user.id, email: user.email, role: user.role },
    // First argument: the payload (data to store inside the token)
    // This is a JavaScript object with the user's id, email, and role
    // userId, email, role are called "claims" - pieces of information about the user

    process.env.JWT_SECRET,
    // Second argument: the secret key used to sign the token
    // The secret is read from our .env file via process.env.JWT_SECRET
    // This secret is used to both sign and verify tokens - keep it secret!

    { expiresIn: '24h' }
    // Third argument: options object
    // expiresIn sets how long the token is valid for
    // '24h' means the token will expire in 24 hours
    // After expiration, the token can no longer be verified
  );
}

// ============================================================
// TASK 1: Test Token Routes (GET /api/test-token)
// ============================================================

app.get('/api/test-token', (req, res) => {
  // app.get() creates a route that handles GET HTTP requests
  // First argument: the URL path (endpoint) this route handles
  // Second argument: a callback function that runs when someone visits this endpoint
  // req = request object (contains data from the client)
  // res = response object (used to send data back to the client)

  const sampleUser = { id: 1, email: 'wanjiku@mail.com', role: 'user' };
  // Create a sample user object to test token generation
  // This simulates what a real user would look like after registration

  const results = {};
  // Create an empty object to store our test results
  // We'll add properties to this object as we run each test

  // --- Test 1: Valid Token ---
  try {
    // try block runs the code that might throw an error

    const token = generateToken(sampleUser);
    // Call our generateToken function to create a token for the sample user
    // This token has a 24-hour expiry

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // jwt.verify() checks if the token is valid using the same secret key used to sign it
    // If valid, it returns the decoded payload (the data we put inside)
    // If invalid/expired, it throws an error

    results.test1 = {
      // Add a test1 property to our results object
      // This object contains the test name, the token, and the decoded data

      test: 'Valid Token - Token generated and verified successfully',
      token: token,
      decoded: decoded
      // decoded is an object like: { userId: 1, email: 'wanjiku@mail.com', role: 'user', iat: ..., exp: ... }
      // iat = "issued at" timestamp (when the token was created)
      // exp = "expiration" timestamp (when the token expires)
    };

  } catch (error) {
    // If jwt.verify() throws an error, we catch it here
    // This shouldn't happen in test 1 since the token is valid

    results.test1 = { test: 'Valid Token - Unexpected Error', error: error.message };
    // Store the error message in our results
  }

  // --- Test 2: Expired Token ---
  try {
    const expiredToken = jwt.sign(
      // Create a token that expires very quickly

      { userId: sampleUser.id, email: sampleUser.email, role: sampleUser.role },
      // Same payload as before (userId, email, role)

      process.env.JWT_SECRET,
      // Same secret key

      { expiresIn: '1s' }
      // expiresIn: '1s' means this token expires in just 1 second
      // This is intentionally short so we can test expiration behavior
    );

    const start = Date.now();
    // Date.now() returns the current time in milliseconds since 1970
    // We save this to calculate how long we waited

    while (Date.now() - start < 2000) {
      // This while loop runs until 2000 milliseconds (2 seconds) have passed
      // It's a "busy wait" that blocks execution for 2 seconds
      // This ensures the 1-second token has definitely expired
      // The empty curly braces {} mean "do nothing" inside the loop
    }

    jwt.verify(expiredToken, process.env.JWT_SECRET);
    // Try to verify the expired token
    // Since we waited 2 seconds and the token only lasts 1 second, this should throw an error

    results.test2 = { test: 'Expired Token - Token should have expired' };
    // This line only runs if jwt.verify() somehow succeeded (which it shouldn't)

  } catch (error) {
    // This catch block runs because jwt.verify() threw an error for the expired token

    results.test2 = {
      test: 'Expired Token - Correctly caught expiration error',
      errorName: error.name,
      // error.name will be 'TokenExpiredError' - the specific type of error for expired tokens

      errorMessage: error.message
      // error.message contains the human-readable error description like 'jwt expired'
    };
  }

  // --- Test 3: Tampered Token ---
  try {
    const validToken = generateToken(sampleUser);
    // First, generate a valid token for the sample user

    const tamperedToken = validToken.slice(0, -5) + 'XXXXX';
    // .slice(0, -5) takes the token string from the beginning to 5 characters before the end
    // This removes the last 5 characters of the token
    // + 'XXXXX' appends the string 'XXXXX' to the end
    // The result is a token that looks real but has been modified (tampered)

    jwt.verify(tamperedToken, process.env.JWT_SECRET);
    // Try to verify the tampered token
    // jwt.verify() detects that the signature doesn't match and throws an error

    results.test3 = { test: 'Tampered Token - Token should be invalid' };
    // This only runs if the tampered token was verified (which shouldn't happen)

  } catch (error) {
    // This catch block runs because jwt.verify() detected the tampered token

    results.test3 = {
      test: 'Tampered Token - Correctly caught tampering error',
      errorName: error.name,
      // error.name will be 'JsonWebTokenError' - the error for invalid/tampered tokens

      errorMessage: error.message
      // error.message will be something like 'invalid signature'
    };
  }

  res.json(results);
  // Send the results object back to the client as a JSON response
  // .json() automatically sets the Content-Type header to application/json and sends the data
});

// ============================================================
// TASK 3: Authentication Routes
// ============================================================

app.post('/api/auth/register', async (req, res) => {
  // app.post() creates a route that handles POST HTTP requests
  // POST is used when the client wants to send data (like a registration form) to the server
  // async keyword means this function uses 'await' for asynchronous operations
  // Asynchronous operations (like password hashing) take time and don't block other code

  const { name, email, password } = req.body;
  // Destructure the request body to extract name, email, and password
  // req.body contains the JSON data sent by the client in the request body
  // Destructuring is a shorthand way to create variables from object properties
  // Equivalent to: const name = req.body.name; const email = req.body.email; const password = req.body.password;

  if (!name || !email || !password) {
    // Check if any of the required fields are missing
    // The || operator means "OR" - if ANY of these conditions is true, enter the if block
    // !name is true when name is undefined, null, or empty string

    return res.status(400).json({ error: 'Name, email, and password are required.' });
    // 400 = Bad Request - the client didn't provide all required data
    // return stops the function execution so the rest of the code doesn't run
  }

  const existingUser = users.find(user => user.email === email);
  // .find() is an array method that returns the first element matching the condition
  // user => user.email === email is an arrow function (a shorter way to write functions)
  // This checks if any user in the array already has this email address
  // If found, existingUser will be that user object; if not found, it's undefined

  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered.' });
    // 409 = Conflict - the email is already taken
  }

  const salt = await bcrypt.genSalt(10);
  // bcrypt.genSalt() generates a "salt" - a random string added to passwords before hashing
  // 10 is the "salt rounds" - higher number = more secure but slower
  // await pauses execution until genSalt() completes (it takes time because it uses the CPU)
  // await can only be used inside async functions

  const hashedPassword = await bcrypt.hash(password, salt);
  // bcrypt.hash() takes the plain text password and the salt and creates a secure hash
  // A hash is a one-way encryption - you can't reverse it back to the original password
  // The result is a long string that looks like random characters

  const newUser = {
    id: userIdCounter++,
    // Assign the current counter value as the ID, then increment the counter
    // The ++ after the variable means "use the value FIRST, then increment"
    // So the first user gets id=1, second gets id=2, etc.

    name: name,
    // Store the user's name

    email: email,
    // Store the user's email

    password: hashedPassword,
    // Store the hashed password (NOT the original plain text password!)
    // We NEVER store plain text passwords for security reasons

    role: 'user'
    // Default role for new users
  };

  users.push(newUser);
  // .push() adds the new user object to the end of the users array

  const token = generateToken(newUser);
  // Generate a JWT token for the newly registered user
  // This way, the user is automatically logged in right after registering

  res.status(201).json({
    // 201 = Created - the standard status code for successful resource creation
    // We send back the token and user data (without the password)

    token: token,
    // The JWT token the client can use for authenticated requests

    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }
    // Send back user info but NOT the password hash
    // Never send password data back to the client!
  });
});

app.post('/api/auth/login', async (req, res) => {
  // POST endpoint for logging in an existing user
  // async because we use await for bcrypt comparison

  const { email, password } = req.body;
  // Extract email and password from the request body sent by the client

  if (!email || !password) {
    // Validation: check if email and password were provided

    return res.status(400).json({ error: 'Email and password are required.' });
    // 400 Bad Request if either field is missing
  }

  const user = users.find(user => user.email === email);
  // Search the users array for a user with the matching email
  // .find() returns the user object if found, or undefined if not found

  if (!user) {
    // If no user was found with that email

    return res.status(401).json({ error: 'Invalid email or password.' });
    // 401 = Unauthorized - credentials are wrong
    // We use a generic message so attackers can't tell if the email exists or not
    // Saying "email not found" would help hackers know which emails are registered
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  // bcrypt.compare() checks if the provided plain text password matches the stored hash
  // It returns true if the password matches, false if it doesn't
  // await pauses execution until bcrypt finishes comparing (it's an async operation)

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
    // Same generic error message for wrong password too
    // This prevents attackers from knowing whether the email exists
  }

  const token = generateToken(user);
  // Generate a new JWT token for the authenticated user
  // The token contains userId, email, and role in its payload

  res.json({
    // Send back the token and user data (status defaults to 200 OK)

    token: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
    // Include user info but NOT the password hash
  });
});

app.get('/api/profile', authenticateToken, (req, res) => {
  // GET endpoint that returns the authenticated user's profile
  // authenticateToken is passed as the SECOND argument (before the callback)
  // This means the middleware runs FIRST, then (if valid) the callback runs
  // If the token is invalid, the middleware sends an error response and the callback never runs

  const user = users.find(u => u.id === req.user.userId);
  // Search the users array for the user whose id matches req.user.userId
  // req.user was set by the authenticateToken middleware (from the decoded token payload)
  // u => u.id === req.user.userId is an arrow function checking each user's id

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
    // 404 = Not Found - if the token's userId doesn't match any user in memory
    // This can happen if users were cleared but old tokens still exist
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
    // Return the user's profile data (still no password hash)
  });
});

// ============================================================
// BONUS CHALLENGE: Token Refresh & Logout
// ============================================================

function generateAccessToken(user) {
  // Creates a short-lived access token (15 minutes)
  // Access tokens are used for authenticating API requests

  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    // Same payload structure as our regular token

    process.env.JWT_SECRET,
    // Same secret key

    { expiresIn: '15m' }
    // expiresIn: '15m' means this token expires in 15 minutes
    // Short expiry limits damage if the token is stolen
  );
}

function generateRefreshToken(user) {
  // Creates a long-lived refresh token (7 days)
  // Refresh tokens are used to get new access tokens without re-logging in

  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, type: 'refresh' },
    // Same payload but with an additional 'type: refresh' claim
    // This lets us distinguish refresh tokens from access tokens

    process.env.JWT_SECRET,
    // Same secret key

    { expiresIn: '7d' }
    // expiresIn: '7d' means this token lasts for 7 days
    // Longer expiry because it's only used to get new access tokens, not for direct API access
  );
}

app.post('/api/auth/refresh', (req, res) => {
  // POST endpoint that accepts a refresh token and returns a new access token

  const { refreshToken } = req.body;
  // Extract the refreshToken from the request body sent by the client
  // The client sends it as JSON: { "refreshToken": "eyJ..." }
  // Curly braces in destructuring extract the property named 'refreshToken' into a variable

  if (!refreshToken) {
    // Check if the refresh token was provided

    return res.status(400).json({ error: 'Refresh token is required.' });
    // 400 Bad Request if no refresh token was sent
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    // Verify that the refresh token is valid and not expired
    // If invalid or expired, it throws an error caught by the catch block

    if (decoded.type !== 'refresh') {
      // Check if this token was specifically created as a refresh token
      // decoded.type was set to 'refresh' in generateRefreshToken
      // This prevents someone from using a regular access token as a refresh token

      return res.status(401).json({ error: 'Invalid token type.' });
      // 401 if the token isn't a refresh token
    }

    const user = users.find(u => u.id === decoded.userId);
    // Find the user in our array using the userId from the decoded token

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
      // 404 if the user no longer exists
    }

    const newAccessToken = generateAccessToken(user);
    // Create a fresh access token for the user

    res.json({ accessToken: newAccessToken });
    // Send back the new access token
    // The client can now use this token for authenticated requests

  } catch (error) {
    // Handle invalid or expired refresh tokens

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token has expired. Please log in again.' });
    }
    // Specific message for expired refresh tokens

    return res.status(401).json({ error: 'Invalid refresh token.' });
    // Generic message for any other token error (tampered, malformed, etc.)
  }
});

app.post('/api/auth/logout', (req, res) => {
  // POST endpoint for logging out (invalidating the current token)
  // The client should send their token in the Authorization header

  const authHeader = req.headers['authorization'];
  // Read the Authorization header from the request

  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  // Extract the token string from "Bearer <token>" format (same logic as in the middleware)

  if (!token) {
    return res.status(400).json({ error: 'No token provided.' });
    // 400 Bad Request if there's no token to blacklist
  }

  tokenBlacklist.add(token);
  // .add() puts the token string into our Set of blacklisted tokens
  // Once added, the authenticateToken middleware will reject this token
  // Set.add() ignores duplicates - if the token is already in the set, nothing changes

  res.json({ message: 'Logged out successfully. Token has been revoked.' });
  // Confirm to the client that the token has been revoked
});

// ============================================================
// Login endpoint using TWO tokens (for the bonus challenge)
// ============================================================

app.post('/api/auth/login-v2', async (req, res) => {
  // An enhanced login endpoint that returns both an access token and a refresh token
  // This is a v2 version that supports the refresh token flow

  const { email, password } = req.body;
  // Extract email and password from the request body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
    // Validate that both fields are present
  }

  const user = users.find(user => user.email === email);
  // Find the user by email

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
    // Generic error for security
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  // Compare password with stored hash

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
    // Same generic error
  }

  const accessToken = generateAccessToken(user);
  // Create a short-lived access token (15 minutes)

  const refreshToken = generateRefreshToken(user);
  // Create a long-lived refresh token (7 days)

  res.json({
    accessToken: accessToken,
    // The short-lived token for API requests (use with Authorization header)

    refreshToken: refreshToken,
    // The long-lived token for getting new access tokens (use with /api/auth/refresh)

    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
    // User info without password
  });
});

// ============================================================
// Start the Server
// ============================================================

app.listen(PORT, () => {
  // app.listen() starts the Express server and makes it listen for incoming connections
  // First argument: the port number to listen on
  // Second argument: a callback function that runs when the server starts successfully

  console.log(`Server running on port ${PORT}`);
  // console.log() prints a message to the terminal
  // The backticks ` ` allow us to embed variables inside strings using ${ }
  // This is called a "template literal" - ${PORT} gets replaced with the actual port number
});
