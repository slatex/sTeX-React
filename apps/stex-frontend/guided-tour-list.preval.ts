import axios from 'axios';
import preval from 'next-plugin-preval';

async function getGuidedTourList() {
  console.log('Fetching guided tour list...');
  const data = await axios
    .get('https://stexmmt.mathhub.info/:vollki/list')
    .then((r) => {
      console.log('Guided tour list fetched');
      return r.data;
    });
  return data;
}

export default preval(getGuidedTourList());
