import {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { HighlightContext, mmtHTMLToReact } from './mmtParser';

export enum DisplayReason {
  FILE_BROWSER = 'FILE_BROWSER',
  FLASH_CARD = 'FLASH_CARD',
  GUIDED_TOUR = 'GUIDED_TOUR',
  HOVER = 'HOVER',
  NOTES = 'NOTES',
  ON_CLICK_DIALOG = 'ON_CLICK_DIALOG',
  SLIDES = 'SLIDES',
}

export const DisplayContext = createContext<{
  topLevelDocUrl: string;
  displayReason: DisplayReason[];
}>({
  topLevelDocUrl: '',
  displayReason: [],
});

export const ContentWithHighlight = memo(
  ({
    mmtHtml,
    modifyRendered = undefined,
    renderWrapperParams = {},
    topLevelDocUrl = undefined,
    displayReason = undefined,
  }: {
    mmtHtml: string;
    modifyRendered?: (node: any) => any;
    renderWrapperParams?: { [key: string]: string };
    topLevelDocUrl?: string;
    displayReason?: DisplayReason;
  }) => {
    const [rendered, setRendered] = useState<any>(<></>);
    const [highlightedParentId, setHighlightedParentId] = useState('');
    const value = useMemo(
      () => ({ highlightedParentId, setHighlightedParentId }),
      [highlightedParentId]
    );
    const previousContext = useContext(DisplayContext);
    useEffect(() => {
      let rendered = mmtHTMLToReact(mmtHtml);
      if (modifyRendered) rendered = modifyRendered(rendered);
      setRendered(rendered);
    }, [mmtHtml, modifyRendered]);

    const mainElement = (
      <HighlightContext.Provider value={value}>
        <div {...renderWrapperParams}>{rendered}</div>
      </HighlightContext.Provider>
    );
    const newTopLevelDocUrl = topLevelDocUrl || previousContext.topLevelDocUrl;
    const newDisplayReason = [...previousContext.displayReason];
    if (displayReason) newDisplayReason.push(displayReason);

    const isDifferentContext =
      newTopLevelDocUrl !== previousContext.topLevelDocUrl || !!displayReason;
    if (!isDifferentContext) return mainElement;

    return (
      <DisplayContext.Provider
        value={{
          topLevelDocUrl: newTopLevelDocUrl,
          displayReason: newDisplayReason,
        }}
      >
        <div {...renderWrapperParams}>{rendered}</div>
      </DisplayContext.Provider>
    );
  }
);
