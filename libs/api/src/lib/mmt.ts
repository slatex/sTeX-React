import axios from 'axios';

export interface SectionsAPIData {
  archive?: string;
  filepath?: string;

  title?: string;
  id?: string;

  ids?: string[];
  children: SectionsAPIData[];
}

export async function getDocumentSections(
  mmtUrl: string,
  archive: string,
  filepath: string
) {
  const resp = await axios.get(
    `${mmtUrl}/:sTeX/sections?archive=${archive}&filepath=${filepath}`
  );
  return resp.data as SectionsAPIData;
}
