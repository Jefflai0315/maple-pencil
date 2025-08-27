import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export async function connectToDatabase() {
  if (!uri) {
    throw new Error("Please add your Mongo URI to .env");
  }

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      ssl: true,
      tls: true,
      retryWrites: true,
      w: "majority",
      retryReads: true,
      connectTimeoutMS: 30000,
    });

    await client.connect();
    const db = client.db("mural-app");
    return { db, client };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function closeConnection(client: MongoClient) {
  try {
    await client.close();
  } catch (error) {
    console.error("Failed to close MongoDB connection:", error);
  }
}
