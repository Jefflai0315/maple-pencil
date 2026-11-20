import { MongoClient, type Db } from "mongodb";

const DB_NAME = "mural-app";

// One MongoClient per server instance, reused by every request. Opening a new
// client per request (the old behaviour) leaked connection pools until MongoDB
// refused new connections, and closing a shared client mid-request broke
// overlapping requests. In development the promise lives on globalThis so hot
// reloads don't open a new pool each time.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoClient?: MongoClient;
};

export function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
    });
    globalForMongo._mongoClientPromise = client
      .connect()
      .then((connected) => {
        globalForMongo._mongoClient = connected;
        return connected;
      })
      .catch((error) => {
        // Let the next request try again instead of caching the failure.
        globalForMongo._mongoClientPromise = undefined;
        throw error;
      });
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  const client = await getMongoClient();
  return { db: client.db(DB_NAME), client };
}

// Kept for older callers: the shared client must stay open, so this does nothing.
export async function closeConnection(client?: MongoClient): Promise<void> {
  void client;
}

// Drop-in replacement for routes that used their own `new MongoClient(...)`
// with connect()/db()/close(). connect() reuses the shared client and close()
// leaves it open for other requests.
export const sharedClient = {
  async connect(): Promise<void> {
    await getMongoClient();
  },
  db(name: string = DB_NAME): Db {
    if (!globalForMongo._mongoClient) {
      throw new Error("MongoDB not connected yet: call connect() first");
    }
    return globalForMongo._mongoClient.db(name);
  },
  async close(): Promise<void> {},
};
