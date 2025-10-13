// MongoDB connection utility for Next.js (App Router)
// Reuses a single client instance across hot reloads in development.

import { MongoClient, Db } from 'mongodb'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB // optional, can be passed per-call

// Don't throw at module import time. Defer validation to runtime when functions are used.
function ensureUri() {
  if (!uri) {
    throw new Error('Missing environment variable: MONGODB_URI')
  }
  return uri
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // Delay creating the client until someone actually requests it
  if (!global._mongoClientPromise) {
    // lazy init placeholder — actual connect will use the validated URI
    global._mongoClientPromise = (async () => {
      const u = ensureUri()
      const c = new MongoClient(u)
      return c.connect()
    })()
  }
  clientPromise = global._mongoClientPromise
} else {
  // Production: create client lazily using validated URI
  client = new MongoClient(ensureUri())
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
