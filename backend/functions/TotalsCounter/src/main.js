import { Client, Users } from 'node-appwrite'

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '')
  const users = new Users(client)

  try {
    const response = await users.list()
    // Log messages and errors to the Appwrite Console
    // These logs won't be seen by your end users
    log(`Total users: ${response.total} :-)`)
  } catch (err) {
    error(`Could not list users: ${err.message}`)
  }

  return res.json({
    totalUsers: response.total,
  })
}
