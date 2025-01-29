import type { FC } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import type { ListItemProps } from '@mui/material/ListItem';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

type Direction = 'horizontal' | 'vertical';

interface PropertyListItemProps extends ListItemProps {
  align?: Direction;
  label: string;
  value?: string;
}

export const PropertyListItem: FC<PropertyListItemProps> = (props) => {
  const { align = 'vertical', children, disableGutters, value, label, ...other } = props;

  return (
    <ListItem
      sx={{
        px: disableGutters ? 0 : 3,
        py: 1.5,
      }}
      {...other}
    >
      <ListItemText
        disableTypography
        primary={
          <Typography
            sx={{ minWidth: align === 'vertical' ? 'inherit' : 180 }}
            variant="subtitle2"
          >
            {label}
          </Typography>
        }
        secondary={
          <Box
            sx={{
              flex: 1,
              mt: align === 'vertical' ? 0.5 : 0,
            }}
          >
            {children || (
              <Typography
                color="text.secondary"
                variant="body2"
              >
                {value}
              </Typography>
            )}
          </Box>
        }
        sx={{
          display: 'flex',
          flexDirection: align === 'vertical' ? 'column' : 'row',
          my: 0,
        }}
      />
    </ListItem>
  );
};

PropertyListItem.propTypes = {
  align: PropTypes.oneOf<Direction>(['horizontal', 'vertical']),
  children: PropTypes.node,
  disableGutters: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};
