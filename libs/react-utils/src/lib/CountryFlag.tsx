export function CountryFlag({
  flag,
  size = 'w20',
  size2 = 'w40',
}: {
  flag: string;
  size?: string;
  size2?: string;
}) {
  return (
    <img
      loading="lazy"
      src={`https://flagcdn.com/${size}/${flag}.png`}
      srcSet={`https://flagcdn.com/${size2}/${flag}.png 2x`}
      alt=""
    />
  );
}
