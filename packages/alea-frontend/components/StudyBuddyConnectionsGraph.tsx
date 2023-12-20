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

function isConnectedNode(
  connections: { senderId: string; receiverId: string }[],
  nodeId: string
): boolean {
  return connections.some((connection) => {
    const hasReverseConnection = connections.some(
      (innerconn) =>
        innerconn.senderId === connection.receiverId &&
        innerconn.receiverId === connection.senderId
    );

    return connection.senderId === nodeId && hasReverseConnection;
  });
}

const transformConnection = (
  senderId: string,
  receiverId: string,
  connectionIdx: number,
  connections: { senderId: string; receiverId: string }[]
): Link => {
  const reverseConnectionIdx = connections.findIndex(
    (conn) => conn.senderId === receiverId && conn.receiverId === senderId
  );
  const hasReverseConnection = reverseConnectionIdx !== -1;
  if (hasReverseConnection && reverseConnectionIdx < connectionIdx) {
    // We already processed the reverse connection.
    return undefined;
  }

  const color = hasReverseConnection ? 'green' : 'gray';
  return { source: senderId, target: receiverId, color };
};

const StudyBuddyConnectionsGraph = ({
  connections,
  userIdsAndActiveStatus,
}: {
  connections: { senderId: string; receiverId: string }[];
  userIdsAndActiveStatus: { userId: string; activeStatus: boolean }[];
}) => {
  const [displayWidth, setDisplayWidth] = useState(500);

  const containerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    setDisplayWidth(containerRef.current?.clientWidth);
    window.addEventListener('resize', () => {
      setDisplayWidth(containerRef.current?.clientWidth);
    });
  }, []);

  const links = connections
    .map(({ senderId, receiverId }, idx) =>
      transformConnection(senderId, receiverId, idx, connections)
    )
    .filter((conn) => conn !== undefined);

  const nodes: Node[] = userIdsAndActiveStatus.map((item) => {
    return {
      id: item.userId,
      color: isConnectedNode(connections, item.userId)
        ? 'green'
        : item.activeStatus
        ? 'red'
        : 'gray',
    };
  });
  const graphData = { nodes, links };

  return (
    <Box sx={{ border: '1px solid black' }} ref={containerRef}>
      <ForceGraph2D
        width={displayWidth}
        height={(displayWidth * 3) / 4}
        graphData={graphData}
        linkDirectionalArrowLength={10}
        linkWidth={(v) => (v.color === 'green' ? 3 : 1)}
      />
    </Box>
  );
};

export default StudyBuddyConnectionsGraph;
