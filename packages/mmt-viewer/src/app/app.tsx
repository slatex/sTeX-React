import { MathJaxContext } from '@stex-react/mathjax';
import {
  ContentWithHighlight,
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
  const noFrills = W.NO_FRILLS.toLowerCase() === 'true';
  const useEmbedded = W.USE_EMBEDDED.toLowerCase() === 'true';
  const mmtHtml = document.getElementById('embedding')?.outerHTML;

  const content = showBrowser ? (
    <>
      <h2 style={{ textAlign: 'center', margin: '10px' }}>sTeX Browser</h2>
      <hr style={{ width: '98%' }} />
      <FileBrowser
        defaultRootNodes={[]}
        topOffset={48}
        standaloneLink={({ archive, filepath }) =>
          `${baseUrl}/:sTeX/browser/fulldocument?archive=${archive}&filepath=${filepath}`
        }
      />
    </>
  ) : useEmbedded && mmtHtml ? (
    <ContentWithHighlight
      mmtHtml={mmtHtml}
      renderWrapperParams={{ 'section-url': 'TOP-LEVEL' }}
    />
  ) : contentUrl?.length ? (
    <StexReactRenderer contentUrl={contentUrl} noFrills={noFrills} />
  ) : (
    <TourDisplay tourId={tourId} language={language} topOffset={0} />
  );

  return (
    <ServerLinksContext.Provider
      value={{ mmtUrl: baseUrl, gptUrl: '' }}
    >
      <MathJaxContext>{content}</MathJaxContext>
    </ServerLinksContext.Provider>
  );
}

export default App;
