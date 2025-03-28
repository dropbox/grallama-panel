import { DataFrame } from '@grafana/data';

export interface GrallamaOptions {
  namePrefix: string;
  urlType: 'details' | 'host' | 'outer' | 'none';
  urlPrefix: string;
  showLabelOptions: boolean;
  showSeriesCount: boolean;
}

export const DEFAULT_OPTIONS: GrallamaOptions = {
  namePrefix: '',
  urlType: 'details',
  urlPrefix: '',
  showLabelOptions: false,
  showSeriesCount: true,
};

export interface GrallamaData {
  name: string;
  total: number;
  success: number;
  error: number;
  latency: number;
  url?: string;
}

export interface PanelProps {
  options: GrallamaOptions;
  data: DataFrame[];
  width: number;
  height: number;
}
