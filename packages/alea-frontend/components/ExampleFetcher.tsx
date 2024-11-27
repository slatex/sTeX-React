import React, { useContext, useEffect, useState } from 'react';
import { mmtHTMLToReact, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { getLearningObjectShtml } from '@stex-react/api';
import { getRandomMessage } from '../pages/guided-tour2/[id]';
import { noTypeMessages } from '../pages/guided-tour2/messages';

const ExampleFetcher = ({ link }) => {
  const [example, setExample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);
  useEffect(() => {
    const fetchExampleResponse = async () => {
      if (!link) {
        setError('No link provided to fetch the Example.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getLearningObjectShtml(mmtUrl, link);
        setExample(response);
      } catch (error) {
        setError(error.message || 'Failed to fetch the definition.');
      } finally {
        setLoading(false);
      }
    };

    fetchExampleResponse();
  }, []);

  if (!link) {
    return (
      <div>
        <p> {getRandomMessage(noTypeMessages, 'example')}</p>
      </div>
    );
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!example) {
    return <p>No example found for the provided link.</p>;
  }

  return (
    <div>
      <h3>Example Response:</h3>
      {mmtHTMLToReact(example)}
    </div>
  );
};
export default ExampleFetcher;
