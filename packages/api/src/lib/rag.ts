import axios from 'axios';

export async function getRagResponse(query: string) {
  try {
    const response = await axios.post('http://localhost:5000/query_index', { query });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
