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
  if (showBrowser) {
    return (
      <MathJaxContext>
        <h2 style={{ textAlign: 'center', margin: '10px' }}>sTeX Browser</h2>
        <hr style={{ width: '98%'}} />
        <FileBrowser
          defaultRootNodes={[]}
          topOffset={48}
          baseUrl={baseUrl}
          standaloneLink={(archive: string, filepath: string) =>
            `${baseUrl}/:sTeX/browser/fulldocument?archive=${archive}&filepath=${filepath}`
          }
        />
      </MathJaxContext>
    );
  }

  return (
    <MathJaxContext>
      {contentUrl?.length ? (
        <StexReactRenderer contentUrl={baseUrl + contentUrl} />
      ) : (
        <TourDisplay tourId={tourId} language={language} />
      )}
    </MathJaxContext>
  );
}

export default App;
