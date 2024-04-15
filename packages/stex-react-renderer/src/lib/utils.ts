export function extractProjectIdAndFilepath(problemId: string) {
    const url = problemId
      .replace('http://mathhub.info/', '')
      .replace(/\?en.*/, '');
    const parts = url.split('/');
    const projectId = parts[0] + '/' + parts[1];
    const filePath = parts.slice(2).join('/').replace('.omdoc', '.tex');
    return [projectId, filePath];
  }