import { FTMLProblemWithSolution } from "@stex-react/api";

export function validateQuizUpdate(
  originalProblems: Record<string, FTMLProblemWithSolution>,
  newProblems: Record<string, FTMLProblemWithSolution>,
  totalStudents: number
) {
  if (totalStudents === 0) return { valid: true };
  const originalURIs = Object.values(originalProblems)
    .map((p) => p.problem?.uri || '')
    .filter(Boolean)
    .sort();

  const newURIs = Object.values(newProblems)
    .map((p) => p.problem?.uri || '')
    .filter(Boolean)
    .sort();

  if (
    originalURIs.length !== newURIs.length ||
    originalURIs.some((uri, idx) => uri !== newURIs[idx])
  ) {
    const notFoundURIs = originalURIs.filter(
      (uri) => !newURIs.includes(uri)
    );
    return {
      valid: false,
      notFoundURIs,
    };
  }

  return { valid: true };
}