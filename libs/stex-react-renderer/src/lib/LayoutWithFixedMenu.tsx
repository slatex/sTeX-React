import ListIcon from '@mui/icons-material/List';
import { Box, Drawer, IconButton } from '@mui/material';
import { Window } from '@stex-react/utils';
import { createContext, useContext, useEffect, useState } from 'react';
import styles from './stex-react-renderer.module.scss';

const MenuContext = createContext({ offset: 0, inDrawer: false });

export function FixedPositionMenu({
  staticContent = undefined,
  children,
}: {
  staticContent?: any;
  children: any;
}) {
  const { offset, inDrawer } = useContext(MenuContext);
  if (inDrawer) {
    return (
      <Box
        maxHeight="100vh"
        maxWidth="400px"
        display="flex"
        flexDirection="column"
      >
        {staticContent}
        <Box sx={{ overflowY: 'scroll', overflowX: 'hidden' }}>
          {children}
          <br />
          <br />
          <br />
        </Box>
      </Box>
    );
  }
  return (
    <Box className={styles['dash_outer_box']}>
      <Box className={styles['dash_inner_box']} mt={`${offset}px`}>
        {staticContent}
        <Box className={styles['dash_scroll_area_box']}>
          <Box sx={{ overflowX: 'hidden' }}>
            {children}
            <br />
            <br />
            <br />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function LayoutWithFixedMenu({
  menu,
  children,
  showDashboard,
  setShowDashboard,
  topOffset,
  alwaysShowWhenNotDrawer = false,
  drawerAnchor = 'left',
}: {
  menu: any;
  children: any;
  showDashboard: boolean;
  setShowDashboard: any;
  topOffset: number;
  alwaysShowWhenNotDrawer?: boolean;
  drawerAnchor?: 'left' | 'right';
}) {
  const [windowSize, setWindowSize] = useState(0);
  const [offset, setOffset] = useState(topOffset);

  useEffect(() => {
    const onScroll = () =>
      setOffset(Math.max(topOffset - (Window?.pageYOffset || 0), 0));
    // clean up code
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [topOffset]);

  useEffect(() => {
    function handleResize() {
      setWindowSize(Window?.innerWidth || 0);
    }
    setWindowSize(Window?.innerWidth || 0);
    Window?.addEventListener('resize', handleResize);
  }, []);

  const useDrawer = windowSize < 800;
  const dashVisible = showDashboard || (!useDrawer && alwaysShowWhenNotDrawer);

  return (
    <>
      <Drawer
        anchor={drawerAnchor}
        open={useDrawer && showDashboard}
        onClose={() => setShowDashboard(false)}
      >
        <MenuContext.Provider value={{ offset, inDrawer: true }}>
          {menu}
        </MenuContext.Provider>
      </Drawer>

      {!dashVisible && (
        <Box
          sx={{
            position: 'fixed',
            top: useDrawer ? undefined : `${offset + 10}px`,
            bottom: useDrawer ? '20px' : undefined,
            left: drawerAnchor === 'left' ? '5px' : undefined,
            right: drawerAnchor === 'right' ? '5px' : undefined,
            zIndex: 1000,
          }}
        >
          <IconButton
            sx={{
              border: '2px solid #203360',
              borderRadius: '500px',
              color: '#203360',
              backgroundColor: 'white',
              boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.3s ease 0s',
              ':hover': {
                boxShadow: '0px 15px 20px rgba(0, 0, 0, 0.4)',
                transform: 'translateY(1px)',
                backgroundColor: 'white',
              },
            }}
            onClick={() => setShowDashboard(true)}
          >
            <ListIcon />
          </IconButton>
        </Box>
      )}

      <Box
        display="flex"
        flexDirection={drawerAnchor === 'left' ? 'row' : 'row-reverse'}
      >
        {!useDrawer && dashVisible && (
          <Box width="300px" minWidth="300px" sx={{ overflowY: 'auto' }}>
            <MenuContext.Provider value={{ offset, inDrawer: false }}>
              {menu}
            </MenuContext.Provider>
          </Box>
        )}
        {children}
      </Box>
    </>
  );
}
