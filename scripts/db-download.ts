import { Query, Databases, Client } from 'node-appwrite'

const runner = async () => {
  const client = new Client()

  client
    .setEndpoint('https://api.tcgpocketcollectiontracker.com/v1') // Your API Endpoint
    .setProject('679d358b0013b9a1797f') // Your project ID
    .setKey(
      'standard_3279d7e49bf708b63d2b1dd70803cf9b252f7b1d05662cba1937af318ac3aee175a4c1eb9674628cfa51d67d07a2900d490a8065c6f1c43c6d843baea1bd52ef586234b762a1f6ff12d091a3ceffc6b8d78ffb8432851bd9daea7265e091500731ed9bd1461b6020cd095854bb5a5e559ee085acb2012157185de58c506aa2ab',
    ) // Your secret API key
    .setSelfSigned(true) // Use only on dev mode with a self-signed SSL cert

  const database = new Databases(client)

  const DATABASE_ID = '679f7ce60013c742add3'
  const COLLECTION_ID = '679f7cf50003d1a172c5'
  const QUERY_LIMIT = 500

  const page1 = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(QUERY_LIMIT)])
  console.log('page1', page1)

  const lastId = page1.documents[page1.documents.length - 1].$id

  const page2 = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(QUERY_LIMIT), Query.cursorAfter(lastId)])
  console.log('page2', page2)
}

runner()
