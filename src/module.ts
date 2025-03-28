import { PanelPlugin } from '@grafana/data';
import { GrallamaPanel } from './components/GrallamaPanel';
import { GrallamaOptions, DEFAULT_OPTIONS } from './types';

export const plugin = new PanelPlugin<GrallamaOptions>(GrallamaPanel)
  .setPanelOptions(builder => {
    return builder
      .addTextInput({
        path: 'namePrefix',
        name: 'Name Prefix',
        description: 'Prefix for name fields',
        defaultValue: DEFAULT_OPTIONS.namePrefix,
      })
      .addSelect({
        path: 'urlType',
        name: 'URL Type',
        description: 'Type of URL to generate',
        defaultValue: DEFAULT_OPTIONS.urlType,
        settings: {
          options: [
            { value: 'details', label: 'Details' },
            { value: 'host', label: 'Host' },
            { value: 'outer', label: 'Outer' },
            { value: 'none', label: 'None' },
          ],
        },
      })
      .addTextInput({
        path: 'urlPrefix',
        name: 'URL Prefix',
        description: 'Prefix for URLs',
        defaultValue: DEFAULT_OPTIONS.urlPrefix,
      })
      .addBooleanSwitch({
        path: 'showLabelOptions',
        name: 'Show Label Options',
        description: 'Display extra options for labels',
        defaultValue: DEFAULT_OPTIONS.showLabelOptions,
      })
      .addBooleanSwitch({
        path: 'showSeriesCount',
        name: 'Show Series Count',
        description: 'Display series count on hover',
        defaultValue: DEFAULT_OPTIONS.showSeriesCount,
      });
  });
  