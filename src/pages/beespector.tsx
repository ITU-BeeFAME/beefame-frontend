import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { NextPage } from 'next';
import { Layout as MarketingLayout } from 'src/layouts/marketing';
import { Seo } from 'src/components/seo';

import BeespectorNavbar from 'src/components/beespector/Navbar';
import DatapointEditor from 'src/components/beespector/DatapointEditor';
import FeaturesPage from 'src/components/beespector/FeaturesPage';
import PartialDependencies from 'src/components/beespector/PartialDependencies';
import PerformanceFairness from 'src/components/beespector/PerformanceFairness';

import { beespectorApi } from 'src/lib/beespectorAxios';

const BeespectorPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState("datapoint");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [contextInfo, setContextInfo] = useState<any>(null);

  useEffect(() => {
    initializeContext();
  }, []);

  const initializeContext = async () => {
    setIsInitializing(true);
    setInitError(null);
    
    try {
      const initParams = {
        dataset_name: "adult",
        base_classifier: "logistic_regression",
        classifier_params: {
          C: 1.0,
          solver: "liblinear"
        },
        mitigation_method: "reweighing",
        mitigation_params: {},
        sensitive_feature: "sex",
        x1_feature: "age",
        x2_feature: "hours_per_week"
      };

      console.log("Initializing Beespector context with:", initParams);
      
      const response = await beespectorApi.post('/initialize_context', initParams);
      
      console.log("Context initialized:", response.data);
      setContextInfo(response.data);
      setIsInitialized(true);
      
    } catch (error: any) {
      console.error("Failed to initialize context:", error);
      setInitError(error.response?.data?.detail || error.message || "Failed to initialize Beespector");
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Initializing Beespector with models...</Typography>
      </Box>
    );
  }

  if (initError) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {initError}
        </Alert>
        <Button variant="contained" onClick={initializeContext}>
          Retry Initialization
        </Button>
      </Container>
    );
  }

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
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" gutterBottom>
              Beespector
            </Typography>
            {contextInfo && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  Dataset: <strong>{contextInfo.dataset}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Base Model: <strong>{contextInfo.base_classifier}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mitigation: <strong>{contextInfo.mitigation_method}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Samples: <strong>{contextInfo.n_samples}</strong>
                </Typography>
              </Box>
            )}
          </Box>
          
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
            {!isInitialized ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                flexDirection: 'column'
              }}>
                <Typography color="text.secondary" gutterBottom>
                  Beespector context not initialized
                </Typography>
                <Button variant="contained" onClick={initializeContext} sx={{ mt: 2 }}>
                  Initialize Context
                </Button>
              </Box>
            ) : (
              <>
                {activeTab === "datapoint" && <DatapointEditor />}
                {activeTab === "partial" && <PartialDependencies />}
                {activeTab === "performance" && <PerformanceFairness />}
                {activeTab === "features" && <FeaturesPage />}
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
};

BeespectorPage.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>;

export default BeespectorPage;