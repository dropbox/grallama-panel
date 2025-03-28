import React, { useEffect, useRef } from 'react';
import { PanelProps } from '../types';
import { css } from '@emotion/css';
import { useTheme2 } from '@grafana/ui';
import * as d3 from 'd3';
import { processGrallamaData, renderGrallamaViz } from '../utils';

export function GrallamaPanel({ options, data, width, height }: PanelProps) {
  const theme = useTheme2();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || !data.length) {
      return;
    }
    
    try {
      // Clear previous visualization
      d3.select(containerRef.current).selectAll('*').remove();
      
      // Process data similar to the original Angular controller
      const processedData = processGrallamaData(data, options);
      
      // Render visualization using D3
      renderGrallamaViz(containerRef.current, processedData, {
        width,
        height,
        theme,
        options,
      });
    } catch (error) {
      console.error('Error rendering Grallama panel:', error);
      // Could add fallback rendering here
    }
  }, [data, options, width, height, theme]);
  
  const styles = {
    wrapper: css`
      position: relative;
      width: ${width}px;
      height: ${height}px;
    `,
  };
  
  return (
    <div 
      className={styles.wrapper}
      ref={containerRef}
    />
  );
}
