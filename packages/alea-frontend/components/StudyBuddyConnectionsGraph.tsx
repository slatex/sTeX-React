import { Box } from '@mui/material';
import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface Node {
  id: string;
  color: string;
}

interface Link {
  source: string;
  target: string;
  color: string;
}

const StudyBuddyConnectionsGraph = ({
  connections,
  userIdsAndActiveStatus,
}: {
  connections: { senderId: string; receiverId: string }[];
  userIdsAndActiveStatus: { userId: string; activeStatus: boolean }[];
}) => {
  const processedConnections = new Set();
  const transformConnections = (senderId: string, receiverId: string) => {
    const hasReverseConnection = connections.some(
      (conn) =>
        conn.senderId === receiverId &&
        conn.receiverId === senderId &&
        !processedConnections.has(conn)
    );

    if (hasReverseConnection) {
      processedConnections.add({ senderId, receiverId });
      processedConnections.add({ senderId: receiverId, receiverId: senderId });

      return [
        {
          source: `${senderId}`,
          target: `${receiverId}`,
          color: 'green',
        },
        {
          source: `${receiverId}`,
          target: `${senderId}`,
          color: 'green',
        },
      ];
    } else {
      processedConnections.add({ senderId, receiverId });

      return [
        {
          source: `${senderId}`,
          target: `${receiverId}`,
          color: 'gray',
        },
      ];
    }
  };

  const transformedConnections = connections.flatMap(
    ({ senderId, receiverId }) => transformConnections(senderId, receiverId)
  );

  const transformedNodes = userIdsAndActiveStatus.map((item) => ({
    id: item.userId,
    color: item.activeStatus ? 'green' : 'gray',
  }));

  const nodes: Node[] = transformedNodes;
  const links: Link[] = transformedConnections;
  const graphData = { nodes, links };

  return (
    <Box sx={{ border: '1px solid black' }}>
      <ForceGraph2D
        graphData={graphData}
        linkDirectionalArrowLength={3.5}
        linkCurvature={0.25}
        linkDirectionalArrowRelPos={1}
      />
    </Box>
  );
};

export default StudyBuddyConnectionsGraph;
