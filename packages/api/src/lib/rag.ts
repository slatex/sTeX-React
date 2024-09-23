import axios from 'axios';

export async function getRagResponse(query: string, courseId?: string) {
  try {
    const response = await axios.post(`${process.env['NEXT_PUBLIC_GENAI_URL']}/query_metadata`, {
      query: query,
      course_id: courseId,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
