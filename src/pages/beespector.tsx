import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { NextPage } from 'next';
import { Layout as MarketingLayout } from 'src/layouts/marketing';
import { Seo } from 'src/components/seo';

import BeespectorNavbar from 'src/components/beespector/Navbar';
import DatapointEditor from 'src/components/beespector/DatapointEditor';
import FeaturesPage from 'src/components/beespector/FeaturesPage';
import PartialDependencies from 'src/components/beespector/PartialDependencies';
import PerformanceFairness from 'src/components/beespector/PerformanceFairness';

const BeespectorPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState("datapoint");

  return (
    <>
      <Seo title="Beespector | BeeFAME" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h3" gutterBottom>
            Beespector
          </Typography>
          
          <BeespectorNavbar activeTab={activeTab} onChangeTab={setActiveTab} />
          
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mt: 3, 
              borderRadius: 2, 
              bgcolor: 'background.paper',
              minHeight: '600px'
            }}
          >
            {activeTab === "datapoint" && <DatapointEditor />}
            {activeTab === "partial" && <PartialDependencies />}
            {activeTab === "performance" && <PerformanceFairness />}
            {activeTab === "features" && <FeaturesPage />}
          </Paper>
        </Container>
      </Box>
    </>
  );
};

BeespectorPage.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>;

export default BeespectorPage;