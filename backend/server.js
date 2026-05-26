import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import pg from 'pg';
import passport from 'passport';

import { connectDB } from './config/db.js';
import db from './models/index.js';
import configurePassport from './config/passport.js';
import authRoutes from './routes/auth.js';
import teamsRoutes from './routes/teams.js';
import taskRoutes from './routes/tasks.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Passport
configurePassport(passport);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Crucial for sessions/cookies
  })
);
app.use(express.json());

const PgSession = connectPg(session);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const sessionStore = new PgSession({
  pool: pool,
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

// Task Routes
app.use('/api/tasks', taskRoutes);

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
