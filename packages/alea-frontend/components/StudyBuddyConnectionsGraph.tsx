import { Box } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
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

const transformConnections = (
  senderId: string,
  receiverId: string,
  connections: { senderId: string; receiverId: string }[],
  processedConnections: Set<string>
): Link[] => {
  const hasReverseConnection = connections.some(
    (conn) => conn.senderId === receiverId && conn.receiverId === senderId
  );

  const isConnectionProcessed = processedConnections.has(
    `${senderId}-${receiverId}`
  );

  if (isConnectionProcessed) return [];
  processedConnections.add(`${senderId}-${receiverId}`);
  const color = hasReverseConnection ? 'green' : 'gray';
  if (hasReverseConnection) {
    processedConnections.add(`${receiverId}-${senderId}`);
  }
  return [
    {
      source: senderId,
      target: receiverId,
      color,
    },
  ];
};

const StudyBuddyConnectionsGraph = ({
  connections,
  userIdsAndActiveStatus,
}: {
  connections: { senderId: string; receiverId: string }[];
  userIdsAndActiveStatus: { userId: string; activeStatus: boolean }[];
}) => {
  const [displayWidth, setDisplayWidth] = useState(500);
  const processedConnections = new Set<string>();

  const containerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    setDisplayWidth(containerRef.current?.clientWidth);
    window.addEventListener('resize', () => {
      setDisplayWidth(containerRef.current?.clientWidth);
    });
  }, []);

  const transformedConnections = connections.flatMap(
    ({ senderId, receiverId }) =>
      transformConnections(
        senderId,
        receiverId,
        connections,
        processedConnections
      )
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
        linkDirectionalArrowRelPos={1}
      />
    </Box>
  );
};

export default StudyBuddyConnectionsGraph;
