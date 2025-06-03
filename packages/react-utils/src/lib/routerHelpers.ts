import { NextRouter } from 'next/router';

export function updateRouterQuery(
  router: NextRouter,
  updatedParams: Record<string, string | undefined>,
  replace = false
) {
  const newQuery = { ...router.query, ...updatedParams };
  Object.keys(newQuery).forEach((key) => {
    if (newQuery[key] === undefined) delete newQuery[key];
  });

  const method = replace ? router.replace : router.push;
  return method(
    {
      pathname: router.pathname,
      query: newQuery,
    },
    undefined,
    { shallow: true }
  );
}
