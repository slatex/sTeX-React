import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { image } = req.body;

  if (!image) return res.status(400).json({ message: "No image provided" });

  try {
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    const formData = new FormData();
    formData.append("image", image);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const data = response.data;
    if (!data.success) {
      console.error("imgbb upload error: ", data);
      return res.status(500).send;
    }
    const metadata = data.data;

    const result = await executeAndEndSet500OnError(
        `INSERT INTO CdnImages (id, metadata) VALUES (?, ?)`,
        [metadata.id, JSON.stringify(metadata)],
        res
      );

      if(!result) return;

    return res.status(200).json(metadata);
  } catch (error) {
    console.error("Error uploading image to imgbb:", error);
    return res.status(500).json({ message: "Error uploading image to imgbb" });
  }

}

