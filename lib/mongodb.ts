// MongoDB connection utility for Next.js (App Router)
// Reuses a single client instance across hot reloads in development.

import { MongoClient, Db } from 'mongodb'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

type MongoClientType = typeof MongoClient extends new (...args: any[]) => infer R ? R : any

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB // optional, can be passed per-call

if (!uri) {
  // Fail fast so misconfiguration is obvious
  throw new Error('Missing environment variable: MONGODB_URI')
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise as Promise<MongoClient>
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise
}

export async function getDb(name: string = dbName || ''): Promise<Db> {
  const client = await getMongoClient()
  if (!name) {
    // Derive default DB name from URI if not explicitly provided
    const derived = client.options?.dbName
    if (!derived) {
      throw new Error('No database name provided. Set MONGODB_DB or pass a name to getDb().')
    }
    return client.db(derived)
  }
  return client.db(name)
}

export async function ping(): Promise<boolean> {
  const db = await getDb()
  await db.command({ ping: 1 })
  return true
}
