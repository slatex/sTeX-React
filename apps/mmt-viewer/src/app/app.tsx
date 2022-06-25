import { StexReactRenderer } from '@stex-react/stex-react-renderer';

export function App() {
  const contentUrl = (window as any).BASE_URL + (window as any).CONTENT_URL;
  return <StexReactRenderer contentUrl={contentUrl} />;
}

export default App;
