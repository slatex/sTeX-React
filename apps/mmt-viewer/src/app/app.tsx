import {
  FileBrowser,
  MathJaxContext,
  StexReactRenderer,
  TourDisplay,
} from '@stex-react/stex-react-renderer';

export function App() {
  const W = window as any;
  const baseUrl = W.BASE_URL;
  const contentUrl = W.CONTENT_URL;
  const tourId = W.TOUR_ID;
  const language = W.LANGUAGE;
  const showBrowser = W.SHOW_FILE_BROWSER.toLowerCase() === 'true';

  return (
    <MathJaxContext>
      {showBrowser ? (
        <FileBrowser defaultRootNodes={[]} topOffset={64} baseUrl={baseUrl} />
      ) : contentUrl?.length ? (
        <StexReactRenderer contentUrl={baseUrl + contentUrl} />
      ) : (
        <TourDisplay tourId={tourId} language={language} />
      )}
    </MathJaxContext>
  );
}

export default App;
