import 'dotenv/config';
import { Client } from 'pg';

async function createDatabase() {
  const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.PGDATABASE}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database: ${process.env.PGDATABASE}`);
      await client.query(`CREATE DATABASE ${process.env.PGDATABASE}`);
      console.log(`Database '${process.env.PGDATABASE}' created successfully.`);
    } else {
      console.log(`Database '${process.env.PGDATABASE}' already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

createDatabase();