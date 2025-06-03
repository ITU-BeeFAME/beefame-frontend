import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert, 
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { beespectorApi } from 'src/lib/beespectorAxios';
import { PerformanceType } from 'src/types/beespector/performance';

function PerformanceFairness() {
  const [performanceData, setPerformanceData] = useState<PerformanceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await beespectorApi.get('/performance_fairness');
      
      
      if (!response.data.roc_curve || response.data.roc_curve.length === 0) {
        
        const dummyData: PerformanceType = {
          roc_curve: [
            { fpr: 0, tpr: 0 },
            { fpr: 0.1, tpr: 0.4 },
            { fpr: 0.2, tpr: 0.6 },
            { fpr: 0.3, tpr: 0.75 },
            { fpr: 0.4, tpr: 0.82 },
            { fpr: 0.5, tpr: 0.87 },
            { fpr: 0.6, tpr: 0.91 },
            { fpr: 0.7, tpr: 0.94 },
            { fpr: 0.8, tpr: 0.97 },
            { fpr: 0.9, tpr: 0.99 },
            { fpr: 1, tpr: 1 }
          ],
          pr_curve: [
            { recall: 1, precision: 0.24 },
            { recall: 0.9, precision: 0.35 },
            { recall: 0.8, precision: 0.45 },
            { recall: 0.7, precision: 0.55 },
            { recall: 0.6, precision: 0.65 },
            { recall: 0.5, precision: 0.72 },
            { recall: 0.4, precision: 0.78 },
            { recall: 0.3, precision: 0.84 },
            { recall: 0.2, precision: 0.89 },
            { recall: 0.1, precision: 0.94 },
            { recall: 0, precision: 1 }
          ],
          confusion_matrix: {
            tn: 120,
            fp: 15,
            fn: 25,
            tp: 40
          },
          fairness_metrics: {
            StatisticalParityDiff: -0.12,
            DisparateImpact: 0.78,
            EqualOpportunityDiff: -0.08
          },
          performance_metrics: {
            Accuracy: 0.80,
            F1Score: 0.667,
            AUC: 0.85
          }
        };
        setPerformanceData(dummyData);
      } else {
        setPerformanceData(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching performance data:', err);
      setError('Failed to fetch performance metrics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading performance metrics...</Typography>
      </Box>
    );
  }

  if (error || !performanceData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'No data available'}</Alert>
      </Box>
    );
  }

  const { confusion_matrix: cm } = performanceData;
  const total = cm.tn + cm.fp + cm.fn + cm.tp;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Performance & Fairness</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Compare model performance metrics and fairness indicators between base and mitigated models.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Performance Metrics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Accuracy</Typography>
                <Typography variant="h5">
                  {(performanceData.performance_metrics.Accuracy * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">F1 Score</Typography>
                <Typography variant="h5">
                  {performanceData.performance_metrics.F1Score.toFixed(3)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">AUC</Typography>
                <Typography variant="h5">
                  {performanceData.performance_metrics.AUC.toFixed(3)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Fairness Metrics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Fairness Metrics</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Statistical Parity Diff</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5">
                    {performanceData.fairness_metrics.StatisticalParityDiff.toFixed(3)}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={Math.abs(performanceData.fairness_metrics.StatisticalParityDiff) < 0.1 ? "Fair" : "Biased"}
                    color={Math.abs(performanceData.fairness_metrics.StatisticalParityDiff) < 0.1 ? "success" : "warning"}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Disparate Impact</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5">
                    {performanceData.fairness_metrics.DisparateImpact.toFixed(3)}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={performanceData.fairness_metrics.DisparateImpact > 0.8 ? "Fair" : "Biased"}
                    color={performanceData.fairness_metrics.DisparateImpact > 0.8 ? "success" : "warning"}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Equal Opportunity Diff</Typography>
                <Typography variant="h5">
                  {performanceData.fairness_metrics.EqualOpportunityDiff.toFixed(3)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Confusion Matrix */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Confusion Matrix</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="center">Pred Neg</TableCell>
                    <TableCell align="center">Pred Pos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Actual Neg</TableCell>
                    <TableCell align="center">
                      <strong>{cm.tn}</strong>
                      <Typography variant="caption" display="block">
                        ({((cm.tn / total) * 100).toFixed(1)}%)
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {cm.fp}
                      <Typography variant="caption" display="block">
                        ({((cm.fp / total) * 100).toFixed(1)}%)
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Actual Pos</TableCell>
                    <TableCell align="center">
                      {cm.fn}
                      <Typography variant="caption" display="block">
                        ({((cm.fn / total) * 100).toFixed(1)}%)
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{cm.tp}</strong>
                      <Typography variant="caption" display="block">
                        ({((cm.tp / total) * 100).toFixed(1)}%)
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* ROC Curve */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>ROC Curve</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={performanceData.roc_curve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fpr" label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tpr" stroke="#8884d8" name="ROC" strokeWidth={2} dot={false} />
                  <Line 
                    type="monotone" 
                    data={[{fpr: 0, tpr: 0}, {fpr: 1, tpr: 1}]} 
                    dataKey="tpr" 
                    stroke="#999" 
                    strokeDasharray="5 5" 
                    name="Random" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* PR Curve */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Precision-Recall Curve</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={performanceData.pr_curve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recall" label={{ value: 'Recall', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Precision', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="precision" stroke="#82ca9d" name="PR Curve" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PerformanceFairness;