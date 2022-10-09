import axios from 'axios';
import preval from 'next-plugin-preval';

async function getRootFileNode() {
  console.log('Fetching root file nodes...');
  const data = await axios
    .get('https://stexmmt.mathhub.info/:sTeX/browser?menu')
    .then((r) => {
      console.log('Root file nodes fetched');
      return r.data;
    });
  return data;
}

export default preval(getRootFileNode());
