import React, { useState } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Input, Select, Switch, FieldSet, InlineField, InlineSwitch } from '@grafana/ui';
import { PanelOptions } from '../types';

export const GrallamaEditor: React.FC<StandardEditorProps<any, any>> = ({ value, onChange }) => {
  const options = value || {};
  
  const handleChange = (field: string, newValue: any) => {
    onChange({
      ...options,
      [field]: newValue
    });
  };

  const vizTypeOptions = [
    { label: 'Node Link', value: 'nodelink' },
    { label: 'Overlay', value: 'overlay' },
    { label: 'Bundle', value: 'bundle' }
  ];

  const flowDirectionOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' }
  ];

  return (
    <FieldSet>
      <InlineField label="Visualization Type" labelWidth={20}>
        <Select
          options={vizTypeOptions}
          value={options.vizType}
          onChange={v => handleChange('vizType', v.value)}
          width={40}
        />
      </InlineField>

      <InlineField label="Flow Direction" labelWidth={20}>
        <Select
          options={flowDirectionOptions}
          value={options.flowDirection}
          onChange={v => handleChange('flowDirection', v.value)}
          width={40}
        />
      </InlineField>

      <InlineField label="Link Distance" labelWidth={20}>
        <Input
          type="number"
          value={options.linkDistance}
          onChange={e => handleChange('linkDistance', parseInt(e.currentTarget.value, 10))}
          width={40}
        />
      </InlineField>

      <InlineField label="Link Strength" labelWidth={20}>
        <Input
          type="number"
          value={options.linkStrength}
          onChange={e => handleChange('linkStrength', parseFloat(e.currentTarget.value))}
          width={40}
        />
      </InlineField>

      <InlineField label="Node Radius" labelWidth={20}>
        <Input
          type="number"
          value={options.nodeRadius}
          onChange={e => handleChange('nodeRadius', parseInt(e.currentTarget.value, 10))}
          width={40}
        />
      </InlineField>

      <InlineSwitch
        label="Show Node Labels"
        labelClass="width-20"
        checked={options.showNodeLabels}
        onChange={e => handleChange('showNodeLabels', e.currentTarget.checked)}
      />

      <InlineSwitch
        label="Show Link Labels"
        labelClass="width-20"
        checked={options.showLinkLabels}
        onChange={e => handleChange('showLinkLabels', e.currentTarget.checked)}
      />
    </FieldSet>
  );
};
