export function extractProjectIdAndFilepath(problemId: string, fileExtension = '.tex') {
  const url = problemId.replace('http://mathhub.info/', '').replace(/\?en.*/, '');
  const parts = url.split('/');
  const defaultProjectParts = 2;
  let projectParts;
  if (parts[0] === 'courses' || parts[0] === 'sTeX') {
    projectParts = 4;
  } else {
    projectParts = Math.min(defaultProjectParts, parts.length - 2);
  }
  const archive = parts.slice(0, projectParts).join('/');
  const filePath = parts.slice(projectParts).join('/').replace('.omdoc', fileExtension);
  return [archive, filePath];
}
