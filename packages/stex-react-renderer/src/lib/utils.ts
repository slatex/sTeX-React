export function extractProjectIdAndFilepath(problemId: string, fileExtension = '.tex') {
  const url = problemId.replace('http://mathhub.info/', '').replace(/\?en.*/, '');
  const parts = url.split('/');
  const defaultProjectParts = 4;
  const projectParts = Math.min(defaultProjectParts, parts.length - 2);
  const projectId = parts.slice(0, projectParts).join('/');
  let filePath;

  filePath = parts.slice(projectParts).join('/').replace('.omdoc', fileExtension);
  return [projectId, filePath];
}
