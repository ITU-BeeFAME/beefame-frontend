import type { FC } from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

interface FaqType {
  question: string;
  answer: string;
}

const faqs: FaqType[] = [
  {
    question: 'Do you have a free demo to review the code before purchasing?',
    answer:
      'Yes, you can check out our open source dashboard template which should give you an overview of the code quality and folder structure. Keep in mind that some aspects may differ from this Paid version.',
  },
  {
    question: 'How many projects can I build with Bee Fair ITU?',
    answer:
      "The license is per project (domain), but if you intend to develop an unknown number of projects feel free to contact us and we'll find a solution.",
  },
  {
    question: 'How many projects can I build with this template?',
    answer:
      'Absolutely! If you intend to charge users for using your product Extended license is created specifically for this context.',
  },
  {
    question: 'What browsers does the template support?',
    answer:
      "The components in MUI are designed to work in the latest, stable releases of all major browsers, including Chrome, Firefox, Safari, and Edge. We don't support Internet Explorer 11.",
  },
  {
    question: 'For what kind of projects is the Standard license intended?',
    answer:
      'The Standard license is designed for internal applications in which staff will access the application. An example could be the back-office dashboard of a public-facing e-commerce website in which staff would sign in and manage inventory, customers, etc.',
  },
];

interface FaqProps {
  answer: string;
  question: string;
}

const Faq: FC<FaqProps> = (props) => {
  const { answer, question } = props;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <Stack
      onClick={() => setIsExpanded((prevState) => !prevState)}
      spacing={2}
      sx={{ cursor: 'pointer' }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Typography variant="subtitle1">{question}</Typography>
        <SvgIcon>{isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}</SvgIcon>
      </Stack>
      <Collapse in={isExpanded}>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {answer}
        </Typography>
      </Collapse>
    </Stack>
  );
};

Faq.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
};

export const PricingFaqs: FC = (props) => {
  return (
    <Box
      sx={{ py: '120px' }}
      {...props}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={4}
        >
          <Grid
            xs={12}
            md={6}
          >
            <Stack spacing={2}>
              <Typography variant="h3">Everything you need to know</Typography>
              <Typography
                color="text.secondary"
                variant="subtitle2"
              >
                Frequently asked questions
              </Typography>
            </Stack>
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <Stack spacing={4}>
              {faqs.map((faq, index) => (
                <Faq
                  key={index}
                  {...faq}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
