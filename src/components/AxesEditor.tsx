import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Input, Select, InlineField, FieldSet } from '@grafana/ui';
import { AxesOptions } from '../types';

export const AxesEditor: React.FC<StandardEditorProps<any, any>> = ({ value, onChange }) => {
  const axes = value || {};
  
  const handleChange = (field: string, newValue: any) => {
    onChange({
      ...axes,
      [field]: newValue
    });
  };

  const axisScaleOptions = [
    { label: 'Linear', value: 'linear' },
    { label: 'Log', value: 'log' },
    { label: 'Square Root', value: 'sqrt' },
    { label: 'Pow', value: 'pow' }
  ];

  return (
    <FieldSet>
      <InlineField label="X Axis Label" labelWidth={20}>
        <Input
          value={axes.xAxisLabel || ''}
          onChange={e => handleChange('xAxisLabel', e.currentTarget.value)}
          width={40}
        />
      </InlineField>

      <InlineField label="Y Axis Label" labelWidth={20}>
        <Input
          value={axes.yAxisLabel || ''}
          onChange={e => handleChange('yAxisLabel', e.currentTarget.value)}
          width={40}
        />
      </InlineField>

      <InlineField label="X Axis Scale" labelWidth={20}>
        <Select
          options={axisScaleOptions}
          value={axes.xAxisScale}
          onChange={v => handleChange('xAxisScale', v.value)}
          width={40}
        />
      </InlineField>

      <InlineField label="Y Axis Scale" labelWidth={20}>
        <Select
          options={axisScaleOptions}
          value={axes.yAxisScale}
          onChange={v => handleChange('yAxisScale', v.value)}
          width={40}
        />
      </InlineField>

      <InlineField label="X Min" labelWidth={20}>
        <Input
          type="number"
          value={axes.xMin}
          onChange={e => handleChange('xMin', parseFloat(e.currentTarget.value))}
          width={40}
        />
      </InlineField>

      <InlineField label="X Max" labelWidth={20}>
        <Input
          type="number"
          value={axes.xMax}
          onChange={e => handleChange('xMax', parseFloat(e.currentTarget.value))}
          width={40}
        />
      </InlineField>

      <InlineField label="Y Min" labelWidth={20}>
        <Input
          type="number"
          value={axes.yMin}
          onChange={e => handleChange('yMin', parseFloat(e.currentTarget.value))}
          width={40}
        />
      </InlineField>

      <InlineField label="Y Max" labelWidth={20}>
        <Input
          type="number"
          value={axes.yMax}
          onChange={e => handleChange('yMax', parseFloat(e.currentTarget.value))}
          width={40}
        />
      </InlineField>
    </FieldSet>
  );
};
