import { DataFrame } from '@grafana/data';
import { GrallamaData, GrallamaOptions } from './types';
import * as d3 from 'd3';
import { GrafanaTheme2 } from '@grafana/data';

export function processGrallamaData(
  data: DataFrame[], 
  options: GrallamaOptions
): GrallamaData[] {
  const result: GrallamaData[] = [];
  
  // Extract data from dataFrames similar to the original controller logic
  if (data && data.length) {
    for (const series of data) {
      const fields = series.fields;
      
      // Find fields by name or index similar to original logic
      const nameField = fields.find(f => f.name === 'name' || f.name.includes('name'));
      const totalField = fields.find(f => f.name === 'total' || f.name.includes('total'));
      const successField = fields.find(f => f.name === 'success' || f.name.includes('success'));
      const errorField = fields.find(f => f.name === 'error' || f.name.includes('error'));
      const latencyField = fields.find(f => f.name === 'latency' || f.name.includes('latency'));
      
      if (nameField && totalField && successField && errorField) {
        for (let i = 0; i < nameField.values.length; i++) {
          const name = options.namePrefix + nameField.values[i];
          const total = totalField.values[i];
          const success = successField.values[i];
          const error = errorField.values[i];
          const latency = latencyField ? latencyField.values[i] : 0;
          
          let url = '';
          if (options.urlType !== 'none' && options.urlPrefix) {
            url = `${options.urlPrefix}${encodeURIComponent(name)}`;
          }
          
          result.push({
            name,
            total,
            success,
            error,
            latency,
            url,
          });
        }
      }
    }
  }
  
  return result;
}

export function renderGrallamaViz(
  element: HTMLElement,
  data: GrallamaData[],
  {
    width,
    height,
    theme,
    options,
  }: {
    width: number;
    height: number;
    theme: GrafanaTheme2;
    options: GrallamaOptions;
  }
) {
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const svg = d3.select(element)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Sort data by total
  data.sort((a, b) => b.total - a.total);
  
  // Set up scales
  const x = d3.scaleBand()
    .range([0, chartWidth])
    .padding(0.1)
    .domain(data.map(d => d.name));
  
  const y = d3.scaleLinear()
    .range([chartHeight, 0])
    .domain([0, d3.max(data, d => d.total) || 0]);
  
  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');
  
  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y));
  
  // Add success bars
  svg.selectAll('.bar-success')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar-success')
    .attr('x', d => x(d.name) || 0)
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.success))
    .attr('height', d => chartHeight - y(d.success))
    .attr('fill', theme.colors.success.main)
    .on('mouseover', function(event, d) {
      const tooltip = d3.select(element)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', theme.colors.background.secondary)
        .style('color', theme.colors.text.primary)
        .style('padding', '8px')
        .style('border-radius', '2px')
        .style('pointer-events', 'none');
        
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
        
      tooltip.html(`
        <div>
          <strong>${d.name}</strong><br/>
          Total: ${d.total}<br/>
          Success: ${d.success} (${((d.success / d.total) * 100).toFixed(2)}%)<br/>
          Error: ${d.error} (${((d.error / d.total) * 100).toFixed(2)}%)<br/>
          ${d.latency ? `Latency: ${d.latency.toFixed(2)}ms` : ''}
        </div>
      `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function() {
      d3.select(element).selectAll('.tooltip').remove();
    })
    .on('click', function(event, d) {
      if (d.url) {
        window.open(d.url, '_blank');
      }
    });
  
  // Add error bars on top of success bars
  svg.selectAll('.bar-error')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar-error')
    .attr('x', d => x(d.name) || 0)
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.success + d.error))
    .attr('height', d => y(d.success) - y(d.success + d.error))
    .attr('fill', theme.colors.error.main);
}
