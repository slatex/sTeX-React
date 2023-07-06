import axios from 'axios';
import { textContent } from 'domutils';
import * as htmlparser2 from 'htmlparser2';
import { FileLocation } from '@stex-react/utils';

const SLIDE_DOC_CACHE = new Map<string, string>();
export async function getFileContent(
  nodeId: FileLocation,
  mmtUrl: string
): Promise<string> {
  const url = `${mmtUrl}/:sTeX/document?archive=${nodeId.archive}&filepath=${nodeId.filepath}`;
  const inCache = SLIDE_DOC_CACHE.get(url);
  if (inCache) return inCache;
  console.log('Fetching ' + url);
  const resp = await axios.get(url);
  SLIDE_DOC_CACHE.set(url, resp.data);
  return resp.data;
}

export function getText(html: string) {
  const handler = new htmlparser2.DomHandler();
  const parser = new htmlparser2.Parser(handler);

  parser.write(html);
  parser.end();
  const nodes: any = handler.root.childNodes.filter(
    (n: any) => !n.attribs?.['style']?.includes('display:none')
  );
  return textContent(nodes);
}
