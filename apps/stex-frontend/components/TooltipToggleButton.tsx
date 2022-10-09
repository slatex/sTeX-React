import { ToggleButton, Tooltip } from '@mui/material';

export const TooltipToggleButton = ({ children, title, value, ...props }) => (
  <Tooltip title={title}>
    <ToggleButton value={value} {...props}>
      {children}
    </ToggleButton>
  </Tooltip>
);
