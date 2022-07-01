import {
  MathJaxContext,
  StexReactRenderer,
} from '@stex-react/stex-react-renderer';

export function App() {
  const contentUrl = (window as any).BASE_URL + (window as any).CONTENT_URL;
  return (
    <MathJaxContext>
      <StexReactRenderer contentUrl={contentUrl} />
    </MathJaxContext>
  );
}

export default App;
