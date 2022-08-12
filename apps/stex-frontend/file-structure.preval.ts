import axios from 'axios';
import preval from 'next-plugin-preval';

async function getRootFileNode() {
  const data = await axios
    .get('https://mmt.beta.vollki.kwarc.info/:sTeX/browser?menu')
    .then((r) => {
      return r.data;
    });
  return data;
}

export default preval(getRootFileNode());
