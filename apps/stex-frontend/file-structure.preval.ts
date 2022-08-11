import axios from 'axios';
import preval from 'next-plugin-preval';

export interface FileNode {
  label: string;
  link: string;
  children: FileNode[];
  autoOpen?: boolean;
}

async function getRootFileNode(): Promise<FileNode[]> {
  const data = await axios
    .get('https://mmt.beta.vollki.kwarc.info/:sTeX/browser?menu')
    .then((r) => {
      return r.data;
    });
  return data;
}

export default preval(getRootFileNode());
