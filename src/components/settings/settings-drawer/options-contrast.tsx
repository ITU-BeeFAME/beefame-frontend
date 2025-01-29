import type { FC } from 'react';
import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Contrast } from 'src/theme';

interface Option {
  label: string;
  value: Contrast;
}

const options: Option[] = [
  {
    label: 'Normal',
    value: 'normal',
  },
  {
    label: 'High',
    value: 'high',
  },
];

interface OptionsContrastProps {
  onChange?: (value: Contrast) => void;
  value?: Contrast;
}

export const OptionsContrast: FC<OptionsContrastProps> = (props) => {
  const { onChange, value } = props;

  return (
    <Stack spacing={1}>
      <Typography
        color="text.secondary"
        variant="overline"
      >
        Contrast
      </Typography>
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        gap={2}
      >
        {options.map((option) => (
          <Chip
            key={option.label}
            label={option.label}
            onClick={() => onChange?.(option.value)}
            sx={{
              borderColor: 'transparent',
              borderRadius: 1.5,
              borderStyle: 'solid',
              borderWidth: 2,
              ...(option.value === value && {
                borderColor: 'primary.main',
              }),
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

OptionsContrast.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOf(['normal', 'high']),
};
