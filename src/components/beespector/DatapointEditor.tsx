import React, { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  TextField, 
  Paper, 
  Grid,
  Divider,
  Chip
} from '@mui/material';
import ScatterPlot from "./charts/ScatterPlot";
import {
  InitialDataPoint,
  DisplayDataPoint,
  EvaluatedPointData,
  BaseDataFeatures,
} from "src/types/beespector/base-data";
import { beespectorApi } from "src/lib/beespectorAxios";

// Helper function to transform initial data to display data
const transformToDisplayDataPoint = (
  initialPoint: InitialDataPoint
): DisplayDataPoint => {
  return {
    id: initialPoint.id,
    x1: initialPoint.x1,
    x2: initialPoint.x2,
    true_label: initialPoint.true_label,
    features: initialPoint.features,
    base_pred_label: initialPoint.pred_label,
    base_pred_prob: initialPoint.pred_prob,
    mitigated_pred_label: initialPoint.mitigated_pred_label,
    mitigated_pred_prob: initialPoint.mitigated_pred_prob,
  };
};

function DatapointEditor() {
  const [allPoints, setAllPoints] = useState<DisplayDataPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<DisplayDataPoint | null>(null);
  const [internalSelectedPoint, setInternalSelectedPoint] = useState<DisplayDataPoint | null>(null);
  const [highlightedPointId, setHighlightedPointId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Debounce logic for selectedPoint update
  const debouncedSetSelectedPoint = useCallback(
    debounce((point: DisplayDataPoint) => {
      setSelectedPoint(point);
    }, 300),
    []
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching data from beespector API...");
      const res = await beespectorApi.get("/datapoints");
      
      if (!res.data || !res.data.data || !Array.isArray(res.data.data)) {
        throw new Error("Invalid response format from API");
      }
      
      const initialData: InitialDataPoint[] = res.data.data;
      console.log(`Received ${initialData.length} data points`);
      
      const displayData = initialData.map((p) => transformToDisplayDataPoint(p));
      setAllPoints(displayData);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setInternalSelectedPoint(selectedPoint);
  }, [selectedPoint]);

  const handlePointClick = (pointId: number) => {
    const pointToSelect = allPoints.find((p) => p.id === pointId);
    if (pointToSelect) {
      setSelectedPoint({ ...pointToSelect });
    }
  };

  const handleFeatureChange = (
    featureKey: keyof BaseDataFeatures | "x1" | "x2",
    newValue: string | number
  ) => {
    if (!internalSelectedPoint) return;

    setInternalSelectedPoint((prev) => {
      if (!prev) return null;
      const updatedPoint = { ...prev };
      if (featureKey === "x1" || featureKey === "x2") {
        updatedPoint[featureKey] =
          typeof newValue === "number" ? newValue : parseFloat(newValue as string);
      } else {
        updatedPoint.features = {
          ...prev.features,
          [featureKey]: typeof newValue === 'number' ? newValue : newValue,
        };
      }
      debouncedSetSelectedPoint(updatedPoint);
      return updatedPoint;
    });
  };

  const handleUpdatePoint = async () => {
    if (!selectedPoint) return;
    
    setIsUpdating(true);
    const payload = {
      x1: selectedPoint.x1,
      x2: selectedPoint.x2,
      features: selectedPoint.features,
    };
    
    console.log("Sending update payload:", payload);
    
    try {
      const res = await beespectorApi.put<EvaluatedPointData>(
        `/datapoints/${selectedPoint.id}/evaluate`,
        payload
      );
      const evaluatedData = res.data;
      
      // Update all points array
      setAllPoints((prevPoints) =>
        prevPoints.map((p) => {
          if (p.id === evaluatedData.id) {
            return {
              ...p,
              x1: evaluatedData.x1,
              x2: evaluatedData.x2,
              features: evaluatedData.features,
              base_pred_label: evaluatedData.base_model_prediction.pred_label,
              base_pred_prob: evaluatedData.base_model_prediction.pred_prob,
              mitigated_pred_label: evaluatedData.mitigated_model_prediction.pred_label,
              mitigated_pred_prob: evaluatedData.mitigated_model_prediction.pred_prob,
            };
          }
          return p;
        })
      );
      
      // Update selected point
      setSelectedPoint((prevSelected) => {
        if (!prevSelected || prevSelected.id !== evaluatedData.id) {
          return prevSelected;
        }
        return {
          id: evaluatedData.id,
          true_label: evaluatedData.true_label,
          x1: evaluatedData.x1,
          x2: evaluatedData.x2,
          features: evaluatedData.features,
          base_pred_label: evaluatedData.base_model_prediction.pred_label,
          base_pred_prob: evaluatedData.base_model_prediction.pred_prob,
          mitigated_pred_label: evaluatedData.mitigated_model_prediction.pred_label,
          mitigated_pred_prob: evaluatedData.mitigated_model_prediction.pred_prob,
        };
      });
      
      // Highlight the updated point
      setHighlightedPointId(evaluatedData.id);
      setTimeout(() => setHighlightedPointId(null), 2000);
    } catch (error: any) {
      console.error("Error updating point:", error);
      alert("Error updating point. Check console for details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const basePlotData = allPoints.map((p) => ({
    id: p.id,
    x: p.x1,
    y: p.x2,
    pred_label: p.base_pred_label,
  }));

  const mitigatedPlotData = allPoints.map((p) => ({
    id: p.id,
    x: p.x1,
    y: p.x2,
    pred_label: p.mitigated_pred_label,
  }));

  const shapeFuncForScatter = (
    props: any,
    highlightId: number | null,
    currentSelectedId: number | null
  ) => {
    const { cx, cy, payload } = props;
    const pointId = payload.id;
    const isHighlightedUpdate = pointId === highlightId;
    const isCurrentlySelected = pointId === currentSelectedId;
    let radius = 4;
    const fillColor = payload.pred_label === 1 ? "#ff4d4f" : "#1890ff";
    let stroke = "#fff";
    let strokeWidth = 1;
    let extraClassName = "";
    if (isHighlightedUpdate) {
      radius = 7;
      stroke = payload.pred_label === 1 ? "#8B0000" : "#00008B";
      strokeWidth = 2.5;
    }
    if (isCurrentlySelected) {
      extraClassName = "blinking-dot selected-dot-style";
      radius = isHighlightedUpdate ? 7 : 6;
      if (!isHighlightedUpdate) {
        stroke = "#FFD700";
        strokeWidth = 2.5;
      }
    } else if (isHighlightedUpdate) {
      extraClassName = "updated-dot-style";
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={fillColor}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={extraClassName}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading data points...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchInitialData}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Datapoint Editor</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Select a point from either chart. Modify its features in the panel below and click "Apply" to see how its prediction changes for both the base and mitigated models.
      </Typography>
      
      <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Base Model View</Typography>
            <ScatterPlot
              data={basePlotData}
              onPointClick={(data) => handlePointClick(data.id)}
              customShape={(props) =>
                shapeFuncForScatter(props, highlightedPointId, selectedPoint?.id ?? null)
              }
            />
          </Paper>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Fair Model View</Typography>
            <ScatterPlot
              data={mitigatedPlotData}
              onPointClick={(data) => handlePointClick(data.id)}
              customShape={(props) =>
                shapeFuncForScatter(props, highlightedPointId, selectedPoint?.id ?? null)
              }
            />
          </Paper>
        </Box>
        
        <Paper
          sx={{
            width: "420px",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 300px)",
            p: 2,
          }}
        >
          {internalSelectedPoint ? (
            <>
              <Box sx={{ flexShrink: 0, mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box>
                    <Typography variant="h6">Selected: ID {internalSelectedPoint.id}</Typography>
                    <Chip 
                      label={`True Label: ${internalSelectedPoint.true_label}`} 
                      size="small" 
                      color={internalSelectedPoint.true_label === 1 ? "error" : "primary"}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Button
                    onClick={handleUpdatePoint}
                    variant="contained"
                    size="small"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Apply"}
                  </Button>
                </Box>
                
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Base Model:</Typography>
                    <Typography variant="body2">
                      Pred: {internalSelectedPoint.base_pred_label} 
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}({(internalSelectedPoint.base_pred_prob ?? 0).toFixed(3)})
                      </Typography>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Fair Model:</Typography>
                    <Typography variant="body2">
                      Pred: {internalSelectedPoint.mitigated_pred_label}
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}({(internalSelectedPoint.mitigated_pred_prob ?? 0).toFixed(3)})
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Edit Features:
              </Typography>
              
              <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
                <Grid container spacing={1.5}>
                  {/* Plot axis features */}
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="X1 (Age)"
                      type="number"
                      value={internalSelectedPoint.x1}
                      onChange={(e) => handleFeatureChange("x1", parseFloat(e.target.value))}
                      inputProps={{ step: "any" }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="X2 (Hours per Week)"
                      type="number"
                      value={internalSelectedPoint.x2}
                      onChange={(e) => handleFeatureChange("x2", parseFloat(e.target.value))}
                      inputProps={{ step: "any" }}
                    />
                  </Grid>
                  
                  {/* All other features */}
                  {Object.entries(internalSelectedPoint.features).map(([key, val]) => (
                    <Grid item xs={12} key={key}>
                      <TextField
                        fullWidth
                        size="small"
                        label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ").replace(/-/g, " ")}
                        type={typeof val === 'number' ? "number" : "text"}
                        value={val}
                        onChange={(e) => {
                          const newValue = typeof val === 'number' 
                            ? parseFloat(e.target.value) || 0
                            : e.target.value;
                          handleFeatureChange(key as keyof BaseDataFeatures, newValue);
                        }}
                        inputProps={typeof val === 'number' ? { step: "any" } : {}}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              height: "100%",
              textAlign: "center" 
            }}>
              <Typography color="text.secondary">
                No point selected. Click a point on either chart.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default DatapointEditor;