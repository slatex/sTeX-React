import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
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

const FULL_CONNECTION_COL = '#00ff00';

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

function isNodeActiveOrHasSomeConnection(
  { userId, activeStatus },
  connections: { senderId: string; receiverId: string }[]
): boolean {
  return (
    activeStatus ||
    connections.some((c) => c.senderId === userId || c.receiverId === userId)
  );
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

  const color = hasReverseConnection ? FULL_CONNECTION_COL : 'gray';
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
  const fgRef = useRef(null);

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

  const nodes: Node[] = userIdsAndActiveStatus
    .filter((n) => isNodeActiveOrHasSomeConnection(n, connections))
    .map((item) => {
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
        ref={fgRef}
        width={displayWidth}
        height={(displayWidth * 3) / 4}
        graphData={graphData}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkWidth={(v) => (v.color === FULL_CONNECTION_COL ? 2 : 1)}
        cooldownTicks={100}
        onEngineStop={() => fgRef.current.zoomToFit(400)}
      />
    </Box>
  );
};

export default StudyBuddyConnectionsGraph;
