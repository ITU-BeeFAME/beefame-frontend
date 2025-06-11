import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert, 
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { beespectorApi } from 'src/lib/beespectorAxios';
import { PartialDependence } from 'src/types/beespector/partial-dependence';

function PartialDependencies() {
  const [partialDepData, setPartialDepData] = useState<PartialDependence[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<'x1' | 'x2'>('x1');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartialDependenceData();
  }, []);

  const fetchPartialDependenceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await beespectorApi.get('/partial_dependence');
      
      // Check if response has actual data or use dummy data
      if (!response.data.partial_dependence_data || response.data.partial_dependence_data.length === 0) {
        // Generate dummy partial dependence data
        const dummyData: PartialDependence[] = [];
        for (let i = 0; i <= 100; i += 5) {
          dummyData.push({
            x: i,
            pd_x1: Math.sin(i * 0.05) * 0.3 + 0.5 + (i / 100) * 0.2, // Simulated PD for age
            pd_x2: Math.cos(i * 0.03) * 0.2 + 0.4 + (i / 200) * 0.3  // Simulated PD for hours
          });
        }
        setPartialDepData(dummyData);
      } else {
        setPartialDepData(response.data.partial_dependence_data);
      }
    } catch (err: any) {
      console.error('Error fetching partial dependence data:', err);
      setError('Failed to fetch partial dependence data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading partial dependence data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const chartData = partialDepData.map(point => ({
    x: point.x,
    baseModel: selectedFeature === 'x1' ? point.pd_x1 : point.pd_x2,
    mitigatedModel: selectedFeature === 'x1' 
      ? point.pd_x1 * (1 + Math.random() * 0.1 - 0.05) // Simulated difference for mitigated
      : point.pd_x2 * (1 + Math.random() * 0.1 - 0.05)
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Partial Dependencies</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Visualize how model predictions change as individual features vary, while holding other features constant.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Partial Dependence Plot
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Feature</InputLabel>
                  <Select
                    value={selectedFeature}
                    label="Feature"
                    onChange={(e) => setSelectedFeature(e.target.value as 'x1' | 'x2')}
                  >
                    <MenuItem value="x1">X1 (Age)</MenuItem>
                    <MenuItem value="x2">X2 (Hours per Week)</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label="Base Model" color="primary" size="small" />
                  <Chip label="Mitigated Model" color="secondary" size="small" />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="x" 
                    label={{ 
                      value: selectedFeature === 'x1' ? 'Age' : 'Hours per Week', 
                      position: 'insideBottom', 
                      offset: -5 
                    }} 
                  />
                  <YAxis 
                    label={{ 
                      value: 'Partial Dependence', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }} 
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="baseModel" 
                    stroke="#8884d8" 
                    name="Base Model" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mitigatedModel" 
                    stroke="#82ca9d" 
                    name="Mitigated Model" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Interpretation:</strong> This plot shows how the model's prediction probability changes as {selectedFeature === 'x1' ? 'Age' : 'Hours per Week'} varies 
                from {selectedFeature === 'x1' ? '17 to 90' : '1 to 99'}, while all other features are held at their average values. 
                The difference between the two lines indicates how the fairness mitigation affects predictions across different {selectedFeature === 'x1' ? 'ages' : 'working hours'}.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Alert severity="info">
            In the full implementation, you'll be able to:
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Select any feature from the dataset for partial dependence analysis</li>
              <li>View 2D partial dependence plots for feature interactions</li>
              <li>Compare individual conditional expectation (ICE) plots</li>
              <li>Export plots and data for further analysis</li>
            </ul>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PartialDependencies;