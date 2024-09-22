import axios from 'axios';

export async function getRagResponse(query: string, courseId?: string) {
  try {
    const response = await axios.post('http://localhost:5000/query_metadata', {
      query: query,
      course_id: courseId,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
