import * as d3 from 'd3';
import { DataFrame } from '@grafana/data';
import { PanelOptions } from './types';

interface RenderParams {
  element: HTMLElement;
  data: DataFrame[];
  options: PanelOptions;
  width: number;
  height: number;
}

export function renderGrallamaViz({ element, data, options, width, height }: RenderParams) {
  // Clear any existing visualization
  d3.select(element).selectAll('*').remove();

  // Create SVG
  const svg = d3.select(element)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const container = svg.append('g');

  // Add zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on('zoom', (event) => {
      container.attr('transform', event.transform);
    });

  svg.call(zoom as any);
  
  // Extract nodes and links from data frames
  const nodes = extractNodes(data);
  const links = extractLinks(data, nodes);

  // Prepare visualization based on vizType
  switch(options.vizType) {
    case 'nodelink':
      renderNodeLinkDiagram(container, nodes, links, options);
      break;
    case 'overlay':
      renderOverlayDiagram(container, nodes, links, options);
      break;
    case 'bundle':
      renderBundleDiagram(container, nodes, links, options);
      break;
    default:
      renderNodeLinkDiagram(container, nodes, links, options);
  }

  // Add axes if needed
  if (options.axes) {
    addAxes(svg, options.axes, width, height);
  }
}

function extractNodes(data: DataFrame[]) {
  // Implement node extraction from data frames
  const nodes: any[] = [];
  
  // Find node data frame
  const nodeFrame = data.find(df => df.name?.includes('node') || df.fields.some(f => f.name === 'id' || f.name === 'node'));
  
  if (nodeFrame) {
    const idField = nodeFrame.fields.find(f => f.name === 'id' || f.name === 'node');
    const labelField = nodeFrame.fields.find(f => f.name === 'label' || f.name === 'name');
    
    if (idField) {
      for (let i = 0; i < idField.values.length; i++) {
        nodes.push({
          id: idField.values.get(i),
          label: labelField ? labelField.values.get(i) : idField.values.get(i),
        });
      }
    }
  }
  
  return nodes;
}

function extractLinks(data: DataFrame[], nodes: any[]) {
  // Implement link extraction from data frames
  const links: any[] = [];
  
  // Find link data frame
  const linkFrame = data.find(df => df.name?.includes('link') || df.name?.includes('edge') || 
    df.fields.some(f => f.name === 'source' || f.name === 'target'));
  
  if (linkFrame) {
    const sourceField = linkFrame.fields.find(f => f.name === 'source' || f.name === 'from');
    const targetField = linkFrame.fields.find(f => f.name === 'target' || f.name === 'to');
    const valueField = linkFrame.fields.find(f => f.name === 'value' || f.name === 'weight');
    
    if (sourceField && targetField) {
      for (let i = 0; i < sourceField.values.length; i++) {
        links.push({
          source: sourceField.values.get(i),
          target: targetField.values.get(i),
          value: valueField ? valueField.values.get(i) : 1,
        });
      }
    }
  }
  
  return links;
}

function renderNodeLinkDiagram(container: any, nodes: any[], links: any[], options: PanelOptions) {
  // Create a force simulation
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(options.linkDistance).strength(options.linkStrength))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(0, 0));

  // Add links
  const link = container.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', (d: any) => Math.sqrt(d.value));

  // Add nodes
  const node = container.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', options.nodeRadius)
    .attr('fill', '#1f77b4')
    .call(drag(simulation) as any);

  // Add node labels if enabled
  if (options.showNodeLabels) {
    const labels = container.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d: any) => d.label)
      .attr('font-size', '12px')
      .attr('dx', 12)
      .attr('dy', 4);
      
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
        
      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
  } else {
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });
  }
}

function renderOverlayDiagram(container: any, nodes: any[], links: any[], options: PanelOptions) {
  // Implement overlay visualization
  // This would be similar to node-link but with a different layout algorithm
  renderNodeLinkDiagram(container, nodes, links, options);
}

function renderBundleDiagram(container: any, nodes: any[], links: any[], options: PanelOptions) {
  // Implement bundle visualization
  // This would use hierarchical edge bundling
  renderNodeLinkDiagram(container, nodes, links, options);
}

function addAxes(svg: any, axes: any, width: number, height: number) {
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Create scales
  const xScale = getScale(axes.xAxisScale, [0, chartWidth], [axes.xMin, axes.xMax]);
  const yScale = getScale(axes.yAxisScale, [chartHeight, 0], [axes.yMin, axes.yMax]);
  
  // Add X axis
  svg.append('g')
    .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
    
  // Add Y axis
  svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisLeft(yScale));
    
  // Add X axis label
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height - 5)
    .text(axes.xAxisLabel);
    
  // Add Y axis label
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', 15)
    .text(axes.yAxisLabel);
}

function getScale(scaleType: string, range: number[], domain: number[]) {
  switch(scaleType) {
    case 'log':
      return d3.scaleLog().range(range).domain(domain);
    case 'sqrt':
      return d3.scaleSqrt().range(range).domain(domain);
    case 'pow':
      return d3.scalePow().exponent(2).range(range).domain(domain);
    case 'linear':
    default:
      return d3.scaleLinear().range(range).domain(domain);
  }
}

function drag(simulation: any) {
  function dragstarted(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}
