import { PREVALUATED_COURSE_TREES } from '../../../course_info/prevaluated-course-trees';

export default async function handler(req, res) {
  const { courseId } = req.query;

  const courseTree = PREVALUATED_COURSE_TREES[courseId];
  if (!courseTree) {
    res.status(404).json({ error: 'Course not found!' });
    return;
  }
  const index = {};
  const titles = {};
  for (const [idx, line] of courseTree.split('\n').entries()) {
    const parts = line.split('||');
    const nodeId = `${parts[1]}||${parts[2]}`;
    index[nodeId] = idx;

    titles[`${idx}`] = parts[3];
  }
  res.status(200).json({index, titles});
}
