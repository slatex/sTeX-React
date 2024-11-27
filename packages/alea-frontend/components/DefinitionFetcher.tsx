import React, { useContext, useEffect, useState } from 'react';
import { mmtHTMLToReact, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { getLearningObjectShtml } from '@stex-react/api';
import { getRandomMessage } from '../pages/guided-tour2/[id]';
import { noTypeMessages } from '../pages/guided-tour2/messages';

const DefinitionFetcher = ({ link }) => {
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    const fetchDefinitionResponse = async () => {
      if (!link) {
        setError('No link provided to fetch the definition.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getLearningObjectShtml(mmtUrl, link);
        setDefinition(response);
      } catch (error) {
        setError(error.message || 'Failed to fetch the definition.');
      } finally {
        setLoading(false);
      }
    };

    fetchDefinitionResponse();
  }, [link, mmtUrl]);

  if (!link) {
    return (
      <div>
        <p> {getRandomMessage(noTypeMessages, 'definition')}</p>
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
