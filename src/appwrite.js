import { Client, Databases, ID, Query } from 'appwrite'

// Import necessary components from Appwrite SDK
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';

// Log the Appwrite configuration to ensure it's set up correctly
// console.log(`Appwrite Project ID: ${PROJECT_ID}`);
// console.log(`Appwrite Database ID: ${DATABASE_ID}`);
// console.log(`Appwrite Collection ID: ${COLLECTION_ID}`);
// console.log(`Appwrite Endpoint: ${ENDPOINT}`);

// Initialize the Appwrite client with the project ID and endpoint
const client = new Client()
  .setEndpoint(ENDPOINT) // Set your Appwrite endpoint
  .setProject(PROJECT_ID)

// Initialize the Databases service with the client
const database = new Databases(client);

// Function to update the search count for a given search term and movie
export const updateSearchCount = async (searchTerm, movie) => {
  // 1. Use Appwrite SDK to check if the search term exists in the database
 try {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.equal('searchTerm', searchTerm),
  ])

  // 2. If it does, update the count
  if(result.documents.length > 0) {
   const doc = result.documents[0];

   await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
    count: doc.count + 1,
   })
  // 3. If it doesn't, create a new document with the search term and count as 1
  } else {
   await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
    searchTerm,
    count: 1,
    movie_id: movie.id,
    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
   })
  }
 } catch (error) {
    console.error('Error updating search count:', error);
 }
}

// Function to fetch trending movies from the Appwrite database
export const getTrendingMovies = async () => {
    try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc('count'),
      Query.limit(5) // Limit to top 5 trending movies
    ]);
    return result.documents;

  } catch (error) {
    console.error('Error fetching search counts:', error);
    return [];
  }
}