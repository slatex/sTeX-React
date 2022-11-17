import { MathJaxContext } from '@stex-react/mathjax';
import {
  FileBrowser,
  ServerLinksContext,
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
  const content = showBrowser ? (
    <>
      <h2 style={{ textAlign: 'center', margin: '10px' }}>sTeX Browser</h2>
      <hr style={{ width: '98%' }} />
      <FileBrowser
        defaultRootNodes={[]}
        topOffset={48}
        standaloneLink={(archive: string, filepath: string) =>
          `${baseUrl}/:sTeX/browser/fulldocument?archive=${archive}&filepath=${filepath}`
        }
      />
    </>
  ) : contentUrl?.length ? (
    <StexReactRenderer contentUrl={contentUrl} />
  ) : (
    <TourDisplay tourId={tourId} language={language} topOffset={0} />
  );

  return (
    <ServerLinksContext.Provider value={{ mmtUrl: baseUrl, lmsUrl: '' }}>
      <MathJaxContext>{content}</MathJaxContext>
    </ServerLinksContext.Provider>
  );
}

export default App;
