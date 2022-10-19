import { SECTION_IDS } from '../../course_info/ai-1-notes';

export default async function handler(req, res) {
  res.status(200).json(SECTION_IDS);
}
