import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ALL_DIM_CONCEPT_PAIR,
  ALL_LO_RELATION_TYPES,
  AllLoRelationTypes,
  getSparqlQueryForLoRelation,
  LoRelationToDimAndConceptPair,
  sparqlQuery,
} from '@stex-react/api';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { PRIMARY_COL } from '@stex-react/utils';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  DimAndURIListDisplay,
  URIListDisplay,
} from 'packages/stex-react-renderer/src/lib/ProblemDisplay';
import { useContext, useEffect, useState } from 'react';

function processDimAndConceptData(result) {
  try {
    const transformedData = result.results.bindings.map((binding: any) => {
      const relatedData = binding.relatedData.value.split('; ');
      const cognitiveDimensions = relatedData
        .filter((data: string) => data.startsWith('http://mathhub.info/ulo#cognitive-dimension='))
        .map((data: string) => {
          const encodedValue = data.split('=')[1];
          return decodeURIComponent(encodedValue);
        });
      const crossRefs = relatedData
        .filter((data: string) => data.startsWith('http://mathhub.info/ulo#crossrefs='))
        .map((data: string) => {
          const encodedValue = data.split('=')[1];
          const decodedValue = decodeURIComponent(encodedValue);
          return decodedValue.endsWith('#') ? decodedValue.slice(0, -1) : decodedValue;
        });
      return {
        learningObject: binding.learningObject.value,
        obj1: binding.obj1.value,
        cognitiveDimensions,
        crossRefs,
      };
    });
    const finalString = transformedData
      .flatMap(({ cognitiveDimensions, crossRefs }) =>
        cognitiveDimensions.flatMap((dim) =>
          crossRefs.map((ref) => `${dim}:${encodeURIComponent(ref)}`)
        )
      )
      .join(',');
    return finalString;
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

function processConceptOnlyData(result) {
  try {
    const groupedData = result.results.bindings.reduce((acc, { learningObject, obj1 }) => {
      const learningObjectValue = learningObject.value;
      const obj1Value = obj1.value;
      if (!acc[learningObjectValue]) {
        acc[learningObjectValue] = [];
      }
      acc[learningObjectValue].push(obj1Value);
      return acc;
    }, {});
    const finalString = Object.values(groupedData).flat().join(',');
    return finalString;
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

const LoRelations = ({ uri }: { uri: string }) => {
  const { mmtUrl } = useContext(ServerLinksContext);
  const [data, setData] = useState<Record<AllLoRelationTypes, string>>({
    objective: '',
    precondition: '',
    crossrefs: '',
    'example-for': '',
    defines: '',
    specifies: '',
  });
  useEffect(() => {
    const processData = async () => {
      try {
        if (!uri?.length) return;
        const updatedData = { ...data };
        await Promise.all(
          ALL_LO_RELATION_TYPES.map(async (value: AllLoRelationTypes) => {
            const query = getSparqlQueryForLoRelation(uri, value);
            const result = await sparqlQuery(mmtUrl, query);
            const transformedData = ALL_DIM_CONCEPT_PAIR.includes(
              value as LoRelationToDimAndConceptPair
            )
              ? processDimAndConceptData(result)
              : processConceptOnlyData(result);
            updatedData[value] = transformedData;
          })
        );
        setData(updatedData);
      } catch (error) {
        console.error('Error processing data:', error);
      }
    };
    processData();
  }, [uri]);

  const displayData = [
    { title: 'Objectives', data: data.objective },
    { title: 'Crossrefs', data: data.crossrefs },
    { title: 'Specifies', data: data.specifies },
    { title: 'Example-for', data: data['example-for'] },
    { title: 'Defines', data: data.defines },
    { title: 'Precondition', data: data.precondition },
  ];
  if (!uri) return;
  return (
    <Box mb={2}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            borderBottom: '1px solid #BDBDBD',
            '&:hover': {
              backgroundColor: '#F0F0F0',
            },
          }}
        >
          <Typography
            sx={{
              fontWeight: 'bold',
              color: PRIMARY_COL,
            }}
          >
            Show Insights
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: '#F0F2F5',
            padding: '16px',
          }}
        >
          {displayData.some(({ data }) => data) ? (
            displayData
              .filter(({ data }) => data)
              .map(({ title, data }) =>
                title === 'Objectives' || title === 'Precondition' ? (
                  <DimAndURIListDisplay key={title} title={title} data={data} />
                ) : (
                  <Box border="1px solid black" mb="10px" bgcolor="white" key={title}>
                    <Typography fontWeight="bold" sx={{ p: '10px' }}>
                      {title}&nbsp;
                    </Typography>
                    <Box borderTop="1px solid #AAA" p="5px" display="flex" flexWrap="wrap">
                      <URIListDisplay uris={data.split(',')} />
                    </Box>
                  </Box>
                )
              )
          ) : (
            <Typography textAlign="center" color="gray" fontStyle="italic" mt="10px">
              No data available to display.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default LoRelations;
