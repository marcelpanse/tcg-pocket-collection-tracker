import { Client, ID, Query, Storage, Users } from 'node-appwrite'
import { InputFile } from 'node-appwrite/file'

const BUCKET_ID = '67b79b0d0008be153794'
// const DATABASE_ID = '679f7ce60013c742add3'
// const COLLECTION_ID = '679f7cf50003d1a172c5'

// biome-ignore lint/suspicious/noExplicitAny: untyped in the example
export default async ({ req, res, log }: any) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || '')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '')
    .setKey(req.headers['x-appwrite-key'] ?? '')
  const users = new Users(client)
  const storage = new Storage(client)
  // const databases = new Databases(client)

  // get total users
  const response = await users.list([Query.limit(1)])
  const totalUsers = response.total
  log(`Total users: ${totalUsers} :-)`)

  // get total cards (disabled for now - only gets a max of 5000)
  // const { total: totalCards } = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)])
  // log(`Total cards: ${totalCards} :-)`)

  try {
    const fileList = await storage.listFiles(BUCKET_ID, [Query.equal('name', 'totals.json')])
    log('file list', fileList)

    // upload the new version, we'll do this first so there isn't a split second where there is no file at all.
    const uniqueID = ID.unique()
    log('uploading file', uniqueID)
    const nodeFile = InputFile.fromPlainText(JSON.stringify({ totalUsers }), 'totals.json')
    await storage.createFile(BUCKET_ID, uniqueID, nodeFile)

    // delete any old versions
    for (const file of fileList.files) {
      log('deleting old file', file.$id)
      await storage.deleteFile(file.bucketId, file.$id)
    }
  } catch (e: unknown) {
    log('file not found', e)
  }

  return res.json({
    totalUsers: totalUsers,
  })
}
