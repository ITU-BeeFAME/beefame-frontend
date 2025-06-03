import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout as MarketingLayout } from 'src/layouts/marketing';
import { Seo } from 'src/components/seo';
import { useBeeFame } from 'src/contexts/BeeFameContext';

import BeespectorNavbar from 'src/components/beespector/Navbar';
import DatapointEditor from 'src/components/beespector/DatapointEditor';
import FeaturesPage from 'src/components/beespector/FeaturesPage';
import PartialDependencies from 'src/components/beespector/PartialDependencies';
import PerformanceFairness from 'src/components/beespector/PerformanceFairness';

import { beespectorApi } from 'src/lib/beespectorAxios';

const BeespectorPage: NextPage = () => {
  const router = useRouter();
  const { selectedDatasets, selectedClassifiers, selectedMitigations, classifierParams } = useBeeFame();
  
  const [activeTab, setActiveTab] = useState("datapoint");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [contextInfo, setContextInfo] = useState<any>(null);

  useEffect(() => {
    // Check if we have the required context from BeeFAME
    if (selectedDatasets.length === 0 || selectedClassifiers.length === 0) {
      // If not, redirect back to demo page
      router.push('/demo');
      return;
    }
    
    // Initialize with context from BeeFAME
    initializeContext();
  }, [selectedDatasets, selectedClassifiers]);

  const initializeContext = async () => {
    setIsInitializing(true);
    setInitError(null);
    
    try {
      // Use the first dataset and classifier for now
      // In a full implementation, we might allow selecting which combination to explore
      const dataset = selectedDatasets[0];
      const classifier = selectedClassifiers[0];
      const mitigation = selectedMitigations.length > 0 ? selectedMitigations[0] : "None";
      
      // Find the sensitive feature that was analyzed
      const sensitiveFeature = dataset.sensitive_features[0]; // Default to first
      
      const initParams = {
        dataset_name: dataset.slug,
        base_classifier: classifier.name.toLowerCase().replace(/\s+/g, '_'),
        classifier_params: classifierParams[classifier.id] || {},
        mitigation_method: mitigation.toLowerCase().replace(/\s+/g, '_'),
        mitigation_params: {},
        sensitive_feature: sensitiveFeature.name,
        x1_feature: "age", // These should be configurable
        x2_feature: "hours_per_week"
      };

      console.log("Initializing Beespector with BeeFAME context:", initParams);
      
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
        <Typography sx={{ ml: 2 }}>Initializing Beespector with your analysis...</Typography>
      </Box>
    );
  }

  if (initError) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {initError}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/demo')}>
          Back to Analysis
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Seo title="Beespector Deep Dive | BeeFAME" />
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
              Beespector Deep Dive
            </Typography>
            {contextInfo && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Dataset: <strong>{selectedDatasets[0]?.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Base Model: <strong>{selectedClassifiers[0]?.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mitigation: <strong>{selectedMitigations[0] || 'None'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Samples: <strong>{contextInfo.n_samples}</strong>
                </Typography>
              </Box>
            )}
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => router.push('/demo')}
              sx={{ mb: 2 }}
            >
              ← Back to Analysis
            </Button>
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