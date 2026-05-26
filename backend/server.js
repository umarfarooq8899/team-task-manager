import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import passport from 'passport';

import { connectDB } from './config/db.js';
import db from './models/index.js';
import configurePassport from './config/passport.js';
import authRoutes from './routes/auth.js';
import teamsRoutes from './routes/teams.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Passport
configurePassport(passport);

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173', // Adjust this to your frontend URL
    credentials: true, // Crucial for sessions/cookies
  })
);
app.use(express.json());

const PgSession = connectPg(session);
const sessionStore = new PgSession({
  conObject: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
  },
  tableName: 'session',
});

// Configure Express Session
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// Initialize Passport Session
app.use(passport.initialize());
app.use(passport.session());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Team Task Manager API' });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Team Routes
app.use('/api/teams', teamsRoutes);

// Connect to database, sync models, and start server
const startServer = async () => {
  try {
    // Test database connection
    await connectDB();
    
    // Auto-create session table if it doesn't exist
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      ) WITH (OIDS=FALSE);
    `);
    
    await db.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    // Sync models (creates/updates tables in development)
    await db.sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
