import { PanelPlugin } from '@grafana/data';
import { GrallamaPanel } from './components/GrallamaPanel';
import { PanelOptions, defaults } from './types';
import { GrallamaEditor } from './components/GrallamaEditor';
import { AxesEditor } from './components/AxesEditor';

export const plugin = new PanelPlugin<PanelOptions>(GrallamaPanel)
  .setDefaults(defaults)
  .setPanelOptions(builder => {
    return builder
      .addCustomEditor({
        id: 'options',
        path: 'options',
        name: 'Visualization Options',
        editor: GrallamaEditor,
      })
      .addCustomEditor({
        id: 'axes',
        path: 'axes',
        name: 'Axes Configuration',
        editor: AxesEditor,
      });
  });