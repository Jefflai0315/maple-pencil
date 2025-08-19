import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Please add your Mongo URI to .env");
  process.exit(1);
}

const client = new MongoClient(uri);

interface User {
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  isActive: boolean;
}

async function addUser(
  email: string,
  name?: string,
  role: string = "user"
): Promise<void> {
  try {
    await client.connect();
    const db = client.db("mural-app");
    const collection = db.collection("user");

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      console.log(`User ${email} already exists`);
      return;
    }

    const newUser: User = {
      email,
      name: name || email.split("@")[0],
      role,
      createdAt: new Date(),
      isActive: true,
    };

    const result = await collection.insertOne(newUser);
    console.log(
      `✅ User ${email} added successfully with ID: ${result.insertedId}`
    );
  } catch (error) {
    console.error("Error adding user:", error);
  } finally {
    await client.close();
  }
}

async function listUsers(): Promise<void> {
  try {
    await client.connect();
    const db = client.db("mural-app");
    const collection = db.collection("user");

    const users = await collection.find({}).toArray();
    console.log("\n📋 Current users in database:");
    users.forEach((user: any) => {
      console.log(`- ${user.email} (${user.name}) - ${user.role}`);
    });
  } catch (error) {
    console.error("Error listing users:", error);
  } finally {
    await client.close();
  }
}

const command = process.argv[2];
const email = process.argv[3];
const name = process.argv[4];

if (command === "add" && email) {
  addUser(email, name);
} else if (command === "list") {
  listUsers();
} else {
  console.log(`
Usage:
  npx tsx scripts/add-user.ts add <email> [name]  - Add a new user
  npx tsx scripts/add-user.ts list                 - List all users

Examples:
  npx tsx scripts/add-user.ts add jefflai0315@gmail.com "Jeff Lai"
  npx tsx scripts/add-user.ts add playingwithpencil@gmail.com "Playing with Pencil"
  npx tsx scripts/add-user.ts add joycenyx@gmail.com "Joyce"
  npx tsx scripts/add-user.ts list
  `);
}
