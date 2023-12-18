import { Box } from '@mui/material';
import React, { useEffect } from 'react';
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
  const [displayWidth, setDisplayWidth] = React.useState(500);
  const processedConnections = new Set();
  const transformConnections = (senderId, receiverId) => {
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

  const containerRef = React.useRef<HTMLElement>(null);
  useEffect(() => {
    setDisplayWidth(containerRef.current?.clientWidth);
    window.addEventListener('resize', () => {
      setDisplayWidth(containerRef.current?.clientWidth);
    });
  }, []);

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
    <Box sx={{ border: '1px solid black' }} ref={containerRef}>
      <ForceGraph2D
        width={displayWidth}
        height={(displayWidth * 3) / 4}
        graphData={graphData}
        linkDirectionalArrowLength={3.5}
        linkCurvature={0.25}
        linkDirectionalArrowRelPos={1}
      />
    </Box>
  );
};

export default StudyBuddyConnectionsGraph;
