import { getLearningObjectShtml } from '@stex-react/api';
import { mmtHTMLToReact, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { useContext, useEffect, useState } from 'react';
import { getRandomMessage } from '../pages/guided-tour2/[id]';
import { NO_TYPE_MESSAGES } from '../pages/guided-tour2/messages';

const DefinitionFetcher = ({ definitionUri }: { definitionUri: string }) => {
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    const fetchDefinitionResponse = async () => {
      if (!definitionUri) {
        setError('No link provided to fetch the definition.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getLearningObjectShtml(mmtUrl, definitionUri);
        setDefinition(response);
      } catch (error) {
        setError(error.message || 'Failed to fetch the definition.');
      } finally {
        setLoading(false);
      }
    };

    fetchDefinitionResponse();
  }, [definitionUri, mmtUrl]);

  if (!definitionUri) {
    return (
      <div>
        <p> {getRandomMessage(NO_TYPE_MESSAGES, 'definition')}</p>
      </div>
    );
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!definition) {
    return <p>No definition found for the provided link.</p>;
  }

  return (
    <div>
      <h3>Definition Response:</h3>
      {mmtHTMLToReact(definition)}
    </div>
  );
};
export default DefinitionFetcher;
