export type BaseDataFeatures = {
  age: number;
  workclass: string;
  fnlwgt: number;
  education: string;
  education_num: number;
  marital_status: string;
  occupation: string;
  relationship: string;
  race: string;
  sex: string;
  capital_gain: number;
  capital_loss: number;
  "hours-per-week": number; 
  native_country: string;   
  "class": string;          
};

export type InitialDataPoint = {
  id: number;
  x1: number;
  x2: number;
  true_label: number;
  features: BaseDataFeatures;
  pred_label: number;           
  pred_prob: number;           
  mitigated_pred_label: number; 
  mitigated_pred_prob: number; 
};

export type DisplayDataPoint = {
  id: number;
  x1: number;
  x2: number;
  true_label: number;
  features: BaseDataFeatures;
  base_pred_label: number;
  base_pred_prob: number;
  mitigated_pred_label: number;
  mitigated_pred_prob: number;
};

export type EvaluatedPointData = {
  id: number;
  x1: number;
  x2: number;
  features: BaseDataFeatures;
  true_label: number;
  base_model_prediction: {
    pred_label: number;
    pred_prob: number;
  };
  mitigated_model_prediction: {
    pred_label: number;
    pred_prob: number;
  };
};
