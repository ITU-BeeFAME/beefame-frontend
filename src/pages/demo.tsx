import { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Paper,
  Container,
  CardActionArea,
  Chip,
  Link,
  Stack,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';
import {
  ScienceOutlined,
  DatasetOutlined,
  CheckCircleOutline,
  ErrorOutline,
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  Cell,
} from 'recharts';
import { NextPage } from 'next';
import { Layout as MarketingLayout } from 'src/layouts/marketing';
import { Seo } from 'src/components/seo';
import { api } from 'src/lib/axios';

interface SensitiveFeature {
  name: string;
  unprivileged: string;
  privileged: string;
}

interface Dataset {
  id: string;
  name: string;
  slug: string;
  url: string;
  instances: number;
  description: string;
  sensitive_features: SensitiveFeature[];
}

interface Classifier {
  id: string;
  name: string;
  url: string;
}

interface BiasMetric {
  name: string;
  value: number;
  mitigatedValue?: number;
}

interface BiasAnalysis {
  'Sensitive Column': string;
  'Model Accuracy': number;
  'Statistical Parity Difference': number;
  'Equal Opportunity Difference': number;
  'Average Odds Difference': number;
  'Disparate Impact': number;
  'Theil Index': number;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface BiasSection {
  protectedAttribute: string;
  privilegedGroup: string;
  unprivilegedGroup: string;
  accuracy: number;
  mitigatedAccuracy?: number;
  metrics: BiasMetric[];
  biasedMetricsCount?: number;
  totalMetrics?: number;
}

interface AnalysisResponse {
  data: BiasAnalysis[];
}

interface Mitigation {
  id: string;
  name: string;
  type: string;
  url: string;
  description: string;
}

const MetricChart = ({ metric }: { metric: BiasMetric }) => {
  const data: ChartDataItem[] = [
    { name: 'original', value: metric.value },
    ...(metric.mitigatedValue ? [{ name: 'mitigated', value: metric.mitigatedValue }] : []),
  ];

  // Determine y-axis range based on metric name
  const getYAxisConfig = (metricName: string) => {
    if (metricName === 'Disparate Impact') {
      return {
        domain: [0, 2],
        ticks: [0, 0.5, 1, 1.5, 2],
        referenceLine: 1,
      };
    }
    return {
      domain: [-1, 1],
      ticks: [-1, -0.5, 0, 0.5, 1],
      referenceLine: 0,
    };
  };

  const yAxisConfig = getYAxisConfig(metric.name);

  return (
    <Box
      sx={{
        width: '100%',
        height: 200,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Box
        sx={{
          mb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">{metric.name}</Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#1976d2',
                mr: 1,
              }}
            />
            Original: {metric.value.toFixed(2)}
          </Typography>
          {metric.mitigatedValue !== undefined && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#2e7d32',
                  mr: 1,
                }}
              />
              Mitigated: {metric.mitigatedValue.toFixed(2)}
            </Typography>
          )}
        </Stack>
      </Box>
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{ top: 20, right: 5, left: 5, bottom: 5 }}
          barSize={40}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={false}
          />
          <YAxis
            domain={yAxisConfig.domain}
            ticks={yAxisConfig.ticks}
            tick={{ fontSize: 12 }}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [value.toFixed(2)]}
            contentStyle={{
              background: '#fff',
              border: 'none',
              borderRadius: 8,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          />
          <ReferenceLine
            y={yAxisConfig.referenceLine}
            stroke="#666"
            strokeWidth={1}
            label={{
              value: metric.name === 'Disparate Impact' ? 'Fair' : '',
              position: 'right',
              fill: '#666',
            }}
          />
          {metric.name === 'Disparate Impact' && (
            <>
              <ReferenceLine
                y={0.8}
                stroke="#666"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <ReferenceLine
                y={1.2}
                stroke="#666"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            </>
          )}
          <Bar
            dataKey="value"
            fill={undefined}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === 'original' ? '#1976d2' : '#2e7d32'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

const SelectionSummary = ({
  dataset,
  classifier,
  mitigation,
  activeStep,
}: {
  dataset: Dataset | null;
  classifier: Classifier | null;
  mitigation: string;
  activeStep: number;
}) => {
  if (activeStep === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={1}>
        {activeStep >= 1 && dataset && classifier && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DatasetOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Dataset: {dataset.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScienceOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Selected Classifier: {classifier.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutline sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Mitigation: {mitigation || 'None'}
              </Typography>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
};

const Page: NextPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedClassifier, setSelectedClassifier] = useState<Classifier | null>(null);
  const [selectedMitigation, setSelectedMitigation] = useState<string>('');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [classifiers, setClassifiers] = useState<Classifier[]>([]);
  const [mitigations, setMitigations] = useState<Mitigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<BiasSection[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [datasetsResponse, classifiersResponse, mitigationsResponse] = await Promise.all([
          api.get('/datasets'),
          api.get('/classifiers'),
          api.get('/methods'),
        ]);

        setDatasets(datasetsResponse.data.data);
        setClassifiers(classifiersResponse.data.data);
        setMitigations(mitigationsResponse.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const steps = [
    'Select Dataset & Classifier',
    'Check Bias Metrics',
    'Select Mitigation',
    'Review Results',
  ];

  const handleNext = async () => {
    if (activeStep === 0 && selectedDataset && selectedClassifier) {
      setActiveStep((prevStep) => prevStep + 1);
      setAnalysisLoading(true);
      setAnalysisError(null);
      try {
        const response = await api.post<AnalysisResponse>('/analysis', {
          dataset_name: selectedDataset.slug,
          classifier_name: selectedClassifier.name,
        });

        // Transform API response to BiasSection format
        const transformedData: BiasSection[] = response.data.data.map((analysis) => {
          const sensitiveFeature = selectedDataset.sensitive_features.find(
            (feature) => feature.name === analysis['Sensitive Column']
          );

          const metrics: BiasMetric[] = [
            {
              name: 'Statistical Parity Difference',
              value: analysis['Statistical Parity Difference'],
            },
            {
              name: 'Equal Opportunity Difference',
              value: analysis['Equal Opportunity Difference'],
            },
            { name: 'Average Odds Difference', value: analysis['Average Odds Difference'] },
            { name: 'Disparate Impact', value: analysis['Disparate Impact'] },
            { name: 'Theil Index', value: analysis['Theil Index'] },
          ];

          return {
            protectedAttribute: analysis['Sensitive Column'],
            privilegedGroup: sensitiveFeature?.privileged || '',
            unprivilegedGroup: sensitiveFeature?.unprivileged || '',
            accuracy: analysis['Model Accuracy'] * 100,
            metrics,
          };
        });

        setAnalysisData(transformedData);
      } catch (err) {
        setAnalysisError('Failed to analyze dataset. Please try again.');
        console.error('Error analyzing dataset:', err);
      } finally {
        setAnalysisLoading(false);
      }
    } else if (activeStep === 2 && selectedMitigation) {
      setActiveStep((prevStep) => prevStep + 1);
      setAnalysisLoading(true);
      setAnalysisError(null);
      try {
        // Simulated API call to /evaluate endpoint
        const response = await api.post<AnalysisResponse>('/evaluation', {
          dataset_name: selectedDataset?.slug,
          classifier_name: selectedClassifier?.name,
          method_name: selectedMitigation,
        });

        // Update existing analysis data with mitigation results
        const updatedData = analysisData.map((section, index) => {
          const mitigatedAnalysis = response.data.data[index];
          return {
            ...section,
            mitigatedAccuracy: mitigatedAnalysis['Model Accuracy'] * 100,
            metrics: section.metrics.map((metric) => ({
              ...metric,
              mitigatedValue: mitigatedAnalysis[metric.name as keyof BiasAnalysis] as number,
            })),
          };
        });

        setAnalysisData(updatedData);
      } catch (err) {
        setAnalysisError('Failed to apply mitigation. Please try again.');
        console.error('Error applying mitigation:', err);
      } finally {
        setAnalysisLoading(false);
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleDatasetSelect = (dataset: Dataset) => {
    setSelectedDataset(dataset);
  };

  const handleClassifierSelect = (classifier: Classifier) => {
    setSelectedClassifier(classifier);
  };

  const handleMitigationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMitigation(event.target.value);
  };

  const renderStepContent = (step: number) => {
    return (
      <>
        <SelectionSummary
          dataset={selectedDataset}
          classifier={selectedClassifier}
          mitigation={selectedMitigation}
          activeStep={activeStep}
        />
        {(() => {
          switch (step) {
            case 0:
              return (
                <>
                  <Box sx={{ mt: 4 }}>
                    {loading ? (
                      <Box
                        sx={{
                          minHeight: 400,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                        }}
                      >
                        <CircularProgress size={48} />
                        <Typography
                          variant="h6"
                          color="text.secondary"
                        >
                          Loading available datasets and classifiers...
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Please wait while we prepare the options
                        </Typography>
                      </Box>
                    ) : error ? (
                      <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                      >
                        {error}
                      </Alert>
                    ) : (
                      <>
                        <Typography
                          variant="h6"
                          sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}
                        >
                          Select Dataset
                        </Typography>
                        <Grid
                          container
                          spacing={3}
                        >
                          {datasets.map((dataset) => (
                            <Grid
                              item
                              xs={12}
                              md={6}
                              key={dataset.id}
                            >
                              <Card
                                sx={{
                                  height: '100%',
                                  cursor: 'pointer',
                                  borderWidth: 2,
                                  borderStyle: 'solid',
                                  borderColor:
                                    selectedDataset?.id === dataset.id
                                      ? 'primary.main'
                                      : 'transparent',
                                  position: 'relative',
                                }}
                              >
                                {selectedDataset?.id === dataset.id && (
                                  <CheckCircleOutline
                                    sx={{
                                      position: 'absolute',
                                      top: 12,
                                      right: 12,
                                      color: 'primary.main',
                                      fontSize: 24,
                                    }}
                                  />
                                )}
                                <CardActionArea
                                  onClick={() => handleDatasetSelect(dataset)}
                                  sx={{
                                    height: '100%',
                                    alignItems: 'flex-start',
                                    '& .MuiCardContent-root': {
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-start',
                                    },
                                  }}
                                >
                                  <CardContent>
                                    <Typography
                                      variant="h6"
                                      component="div"
                                      gutterBottom
                                    >
                                      {dataset.name}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mb: 2 }}
                                    >
                                      {dataset.description}
                                    </Typography>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ mb: 2 }}
                                    >
                                      <Chip
                                        icon={<DatasetOutlined />}
                                        label={`${dataset.instances} instances`}
                                        size="small"
                                      />
                                      <Link
                                        href={dataset.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ textDecoration: 'none' }}
                                      >
                                        <Chip
                                          label="View Dataset"
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                          clickable
                                        />
                                      </Link>
                                    </Stack>
                                    <Typography
                                      variant="subtitle2"
                                      gutterBottom
                                      sx={{ mb: 1 }}
                                    >
                                      Sensitive Features:
                                    </Typography>
                                    {dataset.sensitive_features.map((feature, index) => (
                                      <Box
                                        key={index}
                                        sx={{ mb: 1.5 }}
                                      >
                                        <Typography
                                          variant="subtitle2"
                                          sx={{ mb: 0.5 }}
                                        >
                                          {feature.name}
                                        </Typography>
                                        <Stack
                                          direction="row"
                                          spacing={2}
                                        >
                                          <Stack
                                            direction="row"
                                            spacing={0.5}
                                            alignItems="center"
                                          >
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Unprivileged:
                                            </Typography>
                                            <Chip
                                              label={feature.unprivileged}
                                              size="small"
                                              variant="outlined"
                                            />
                                          </Stack>
                                          <Stack
                                            direction="row"
                                            spacing={0.5}
                                            alignItems="center"
                                          >
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Privileged:
                                            </Typography>
                                            <Chip
                                              label={feature.privileged}
                                              size="small"
                                              variant="outlined"
                                            />
                                          </Stack>
                                        </Stack>
                                      </Box>
                                    ))}
                                  </CardContent>
                                </CardActionArea>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>

                        <Typography
                          variant="h6"
                          sx={{ mb: 2, mt: 4, fontWeight: 600, color: 'primary.main' }}
                        >
                          Select Classifier
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                          <FormControl sx={{ width: '100%' }}>
                            <RadioGroup
                              value={selectedClassifier?.id || ''}
                              onChange={(e) => {
                                const selected = classifiers.find((c) => c.id === e.target.value);
                                if (selected) handleClassifierSelect(selected);
                              }}
                            >
                              <Grid
                                container
                                spacing={2}
                              >
                                {classifiers.map((classifier) => (
                                  <Grid
                                    item
                                    xs={12}
                                    md={6}
                                    key={classifier.id}
                                  >
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor:
                                          selectedClassifier?.id === classifier.id
                                            ? 'primary.main'
                                            : 'divider',
                                        bgcolor: 'background.paper',
                                        transition: 'all 0.2s',
                                        height: '100%',
                                        '&:hover': {
                                          borderColor: 'primary.main',
                                          bgcolor: 'grey.50',
                                        },
                                      }}
                                    >
                                      <FormControlLabel
                                        value={classifier.id}
                                        control={
                                          <Radio
                                            sx={{
                                              color: 'primary.main',
                                              '&.Mui-checked': {
                                                color: 'primary.main',
                                              },
                                            }}
                                          />
                                        }
                                        label={
                                          <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={2}
                                          >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                              <ScienceOutlined
                                                sx={{
                                                  mr: 1,
                                                  color:
                                                    selectedClassifier?.id === classifier.id
                                                      ? 'primary.main'
                                                      : 'text.secondary',
                                                }}
                                              />
                                              <Typography
                                                sx={{
                                                  fontWeight:
                                                    selectedClassifier?.id === classifier.id
                                                      ? 600
                                                      : 400,
                                                  color:
                                                    selectedClassifier?.id === classifier.id
                                                      ? 'primary.main'
                                                      : 'text.primary',
                                                }}
                                              >
                                                {classifier.name}
                                              </Typography>
                                            </Box>
                                            <Link
                                              href={classifier.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={(e) => e.stopPropagation()}
                                              sx={{ ml: 'auto !important', textDecoration: 'none' }}
                                            >
                                              <Chip
                                                label="Documentation"
                                                size="small"
                                                variant="outlined"
                                                color={
                                                  selectedClassifier?.id === classifier.id
                                                    ? 'primary'
                                                    : 'default'
                                                }
                                                sx={{
                                                  height: 24,
                                                  '&:hover': {
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    '& .MuiChip-label': {
                                                      color: 'white',
                                                    },
                                                  },
                                                }}
                                              />
                                            </Link>
                                          </Stack>
                                        }
                                        sx={{
                                          mx: 0,
                                          width: '100%',
                                          '& .MuiFormControlLabel-label': {
                                            width: '100%',
                                          },
                                        }}
                                      />
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </RadioGroup>
                          </FormControl>
                        </Paper>
                      </>
                    )}
                  </Box>
                </>
              );
            case 1:
              return (
                <Stack spacing={4}>
                  {analysisLoading ? (
                    <Box
                      sx={{
                        minHeight: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <CircularProgress size={48} />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                      >
                        Analyzing dataset with selected classifier...
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        This may take a few minutes
                      </Typography>
                    </Box>
                  ) : analysisError ? (
                    <Alert
                      severity="error"
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={handleNext}
                        >
                          Retry
                        </Button>
                      }
                    >
                      {analysisError}
                    </Alert>
                  ) : (
                    <>
                      <Box>
                        <Typography
                          variant="h5"
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          Check bias metrics
                        </Typography>
                      </Box>

                      {analysisData.map((section, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                        >
                          <Stack spacing={3}>
                            <Box>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: 'primary.main', fontWeight: 600 }}
                              >
                                Protected Attribute: {section.protectedAttribute}
                              </Typography>
                              <Grid
                                container
                                spacing={2}
                              >
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Privileged Group:</strong> {section.privilegedGroup}
                                  </Typography>
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Unprivileged Group:</strong> {section.unprivilegedGroup}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>

                            <Alert
                              severity="info"
                              icon={<ErrorOutline />}
                              sx={{
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                  alignItems: 'center',
                                },
                              }}
                            >
                              <Typography variant="body2">
                                Model Accuracy: {section.accuracy.toFixed(1)}%
                              </Typography>
                            </Alert>

                            <Grid
                              container
                              spacing={3}
                            >
                              {section.metrics.map((metric, idx) => (
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  md={4}
                                  key={idx}
                                >
                                  <MetricChart metric={metric} />
                                </Grid>
                              ))}
                            </Grid>
                          </Stack>
                        </Paper>
                      ))}
                    </>
                  )}
                </Stack>
              );
            case 2:
              return (
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Select Mitigation Strategy
                    </Typography>
                    <Typography
                      color="text.secondary"
                      paragraph
                    >
                      Choose a mitigation method to reduce bias in the model
                    </Typography>
                  </Box>

                  {loading ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      minHeight="200px"
                    >
                      <CircularProgress />
                    </Box>
                  ) : error ? (
                    <Alert
                      severity="error"
                      sx={{ mb: 2 }}
                    >
                      {error}
                    </Alert>
                  ) : (
                    <FormControl>
                      <RadioGroup
                        value={selectedMitigation}
                        onChange={handleMitigationChange}
                      >
                        <Stack spacing={2}>
                          {mitigations.map((mitigation) => (
                            <Paper
                              key={mitigation.id}
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor:
                                  selectedMitigation === mitigation.id ? 'primary.main' : 'divider',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                },
                              }}
                            >
                              <FormControlLabel
                                value={mitigation.name}
                                control={
                                  <Radio
                                    sx={{
                                      color: 'primary.main',
                                      '&.Mui-checked': {
                                        color: 'primary.main',
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Box sx={{ ml: 1 }}>
                                    <Typography
                                      variant="h6"
                                      sx={{ fontWeight: 600, mb: 1 }}
                                    >
                                      {mitigation.name}
                                    </Typography>
                                    <Stack spacing={2}>
                                      <Typography color="text.secondary">
                                        {mitigation.description}
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip
                                          label={mitigation.type}
                                          size="small"
                                          color="primary"
                                          sx={{ fontWeight: 500 }}
                                        />
                                        <Link
                                          href={mitigation.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{ textDecoration: 'none' }}
                                        >
                                          <Chip
                                            label="View Implementation"
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            clickable
                                            sx={{ fontWeight: 500 }}
                                          />
                                        </Link>
                                      </Box>
                                    </Stack>
                                  </Box>
                                }
                                sx={{
                                  margin: 0,
                                  width: '100%',
                                  alignItems: 'flex-start',
                                }}
                              />
                            </Paper>
                          ))}
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                  )}
                </Stack>
              );
            case 3:
              return (
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Review Mitigation Results
                    </Typography>
                  </Box>

                  {analysisLoading ? (
                    <Box
                      sx={{
                        minHeight: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <CircularProgress size={48} />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                      >
                        Applying mitigation and analyzing results...
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        This may take a few minutes
                      </Typography>
                    </Box>
                  ) : analysisError ? (
                    <Alert
                      severity="error"
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setAnalysisLoading(true);
                            setAnalysisError(null);
                            handleNext();
                          }}
                        >
                          Retry
                        </Button>
                      }
                    >
                      {analysisError}
                    </Alert>
                  ) : (
                    <>
                      {analysisData.map((section, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Stack spacing={3}>
                            <Box>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: 'primary.main', fontWeight: 600 }}
                              >
                                Protected Attribute: {section.protectedAttribute}
                              </Typography>
                              <Grid
                                container
                                spacing={2}
                              >
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Privileged Group:</strong> {section.privilegedGroup}
                                  </Typography>
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Unprivileged Group:</strong> {section.unprivilegedGroup}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>

                            <Alert
                              severity={
                                section.biasedMetricsCount && section.biasedMetricsCount > 0
                                  ? 'warning'
                                  : 'success'
                              }
                              icon={<ErrorOutline />}
                              sx={{
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                  alignItems: 'center',
                                },
                              }}
                            >
                              <Stack spacing={1}>
                                <Typography variant="body2">
                                  Original Accuracy: {section.accuracy.toFixed(1)}%
                                </Typography>
                                {section.mitigatedAccuracy && (
                                  <Typography variant="body2">
                                    Accuracy after mitigation:{' '}
                                    {section.mitigatedAccuracy.toFixed(1)}%{' '}
                                    <Typography
                                      component="span"
                                      color={
                                        section.mitigatedAccuracy >= section.accuracy
                                          ? 'success.main'
                                          : 'warning.main'
                                      }
                                      sx={{ fontWeight: 500 }}
                                    >
                                      ({section.mitigatedAccuracy >= section.accuracy ? '+' : ''}
                                      {(section.mitigatedAccuracy - section.accuracy).toFixed(1)}%)
                                    </Typography>
                                  </Typography>
                                )}
                                {section.biasedMetricsCount !== undefined &&
                                  section.totalMetrics !== undefined && (
                                    <Typography variant="body2">
                                      With mitigation applied, bias detected in{' '}
                                      <strong>
                                        {section.biasedMetricsCount} out of {section.totalMetrics}
                                      </strong>{' '}
                                      metrics
                                    </Typography>
                                  )}
                              </Stack>
                            </Alert>

                            <Grid
                              container
                              spacing={3}
                            >
                              {section.metrics.map((metric, idx) => (
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  md={4}
                                  key={idx}
                                >
                                  <MetricChart metric={metric} />
                                </Grid>
                              ))}
                            </Grid>
                          </Stack>
                        </Paper>
                      ))}
                    </>
                  )}
                </Stack>
              );
            default:
              return null;
          }
        })()}
      </>
    );
  };

  return (
    <>
      <Seo title="Demo" />
      <Box
        component="main"
        sx={{
          background: '#f5f5f5',
          mt: '100px',
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Paper
            sx={{ p: 3 }}
            elevation={0}
          >
            <Stepper
              activeStep={activeStep}
              sx={{
                mb: 6,
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#002d62',
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#002d62',
                },
                '& .MuiStepLabel-label': {
                  mt: 1,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                },
                '& .MuiStepConnector-line': {
                  borderColor: 'divider',
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}>
              <Button
                variant="contained"
                disabled={activeStep === 0}
                onClick={handleBack}
                size="large"
                sx={{ mr: 2 }}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? null : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && (!selectedDataset || !selectedClassifier)) ||
                    (activeStep === 2 && !selectedMitigation)
                  }
                  size="large"
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};
Page.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>;

export default Page;
