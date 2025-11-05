import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export function NoiseChart({ data }) {
    const svgRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    const [visible, setVisible] = useState(false);
    // Tooltip state
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: null, time: null });

    // Animation: fade-in when chart is mounted (slower)
    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 600); // 600ms for slower fade-in
        return () => clearTimeout(timer);
    }, []);

    const padDataTo60Points = (originalData) => {
        const TARGET_POINTS = 60;
        if (!originalData || originalData.length === 0) {
            const now = new Date();
            return Array.from({ length: TARGET_POINTS }, (_, i) => ({
                timestamp: new Date(now.getTime() - ((TARGET_POINTS - 1 - i) * 60 * 1000)),
                value: null,
                min: null,
                max: null,
                isZero: true
            }));
        }
        return originalData.map(point => ({
            ...point,
            isZero: point.value === null || point.value === undefined || point.isZero === true
        }));
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                let containerHeight;
                if (containerWidth < 640) {
                    containerHeight = Math.max(180, containerWidth * 0.4);
                } else if (containerWidth < 1024) {
                    containerHeight = Math.max(200, containerWidth * 0.35);
                } else {
                    containerHeight = Math.max(220, Math.min(280, containerWidth * 0.25));
                }
                setDimensions({
                    width: containerWidth,
                    height: containerHeight
                });
            }
        };
        const timeoutId = setTimeout(updateDimensions, 100);
        let resizeTimeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateDimensions, 150);
        };
        window.addEventListener('resize', debouncedResize);
        return () => {
            clearTimeout(timeoutId);
            clearTimeout(resizeTimeout);
            window.removeEventListener('resize', debouncedResize);
        };
    }, []);

    useEffect(() => {
        if (!data) return;
        const paddedData = padDataTo60Points(data);
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const { width, height } = dimensions;
        const margin = width < 640
            ? { top: 10, right: 15, bottom: 25, left: 35 }
            : { top: 15, right: 20, bottom: 30, left: 45 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const xScale = d3.scaleTime()
            .domain(d3.extent(paddedData, d => d.timestamp))
            .range([0, innerWidth]);
        const actualValues = paddedData.filter(d => !d.isZero).map(d => d.value);
        const yDomain = actualValues.length > 0
            ? d3.extent(actualValues)
            : [30, 70];
        const yScale = d3.scaleLinear()
            .domain(yDomain)
            .nice()
            .range([innerHeight, 0]);
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'noise-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0).attr('y1', innerHeight)
            .attr('x2', 0).attr('y2', 0);
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#2563eb')
            .attr('stop-opacity', 0.08);
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#2563eb')
            .attr('stop-opacity', 0.18);
        const line = d3.line()
            .x(d => xScale(d.timestamp))
            .y(d => d.isZero ? innerHeight : yScale(d.value))
            .curve(d3.curveMonotoneX);
        const area = d3.area()
            .x(d => xScale(d.timestamp))
            .y0(innerHeight)
            .y1(d => d.isZero ? innerHeight : yScale(d.value))
            .curve(d3.curveMonotoneX);
        g.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale)
                .tickSize(-innerHeight)
                .tickFormat('')
            );
        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .tickSize(-innerWidth)
                .tickFormat('')
            );
        svg.selectAll('.grid line')
            .style('stroke', '#f1f5f9')
            .style('stroke-width', 0.5)
            .style('opacity', 0.5);
        svg.selectAll('.grid path')
            .style('stroke-width', 0);
        g.append('path')
            .datum(paddedData)
            .attr('fill', 'url(#noise-gradient)')
            .attr('d', area);
        g.append('path')
            .datum(paddedData)
            .attr('fill', 'none')
            .attr('stroke', '#2563eb')
            .attr('stroke-width', 1.25)
            .attr('d', line);
        g.selectAll('.dot')
            .data(paddedData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.timestamp))
            .attr('cy', d => d.isZero ? innerHeight : yScale(d.value))
            .attr('r', 3)
            .attr('fill', d => d.isZero ? '#cbd5e1' : '#2563eb')
            .attr('stroke', d => d.isZero ? '#cbd5e1' : '#2563eb')
            .style('opacity', d => d.isZero ? 0.18 : 0.85)
            .on('mouseover', function(event, d) {
                if (d.isZero) return;
                const svgRect = svgRef.current.getBoundingClientRect();
                setTooltip({
                    visible: true,
                    x: event.clientX - svgRect.left + 10,
                    y: event.clientY - svgRect.top - 10,
                    value: d.value,
                    time: d.timestamp
                });
            })
            .on('mousemove', function(event, d) {
                if (d.isZero) return;
                const svgRect = svgRef.current.getBoundingClientRect();
                setTooltip(t => ({
                    ...t,
                    x: event.clientX - svgRect.left + 10,
                    y: event.clientY - svgRect.top - 10
                }));
            })
            .on('mouseout', function() {
                setTooltip(t => ({ ...t, visible: false }));
            });
        const xTickCount = width < 640 ? 4 : 6;
        g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat('%H:%M'))
                .ticks(xTickCount)
            )
            .style('color', '#94a3b8')
            .selectAll('path, line')
            .style('stroke', '#f1f5f9')
            .style('stroke-width', 0.5);
        const yTickCount = width < 640 ? 3 : 4;
        g.append('g')
            .call(d3.axisLeft(yScale)
                .ticks(yTickCount)
                .tickFormat(d => `${d.toFixed(2)} dB`)
            )
            .style('color', '#94a3b8')
            .selectAll('path, line')
            .style('stroke', '#f1f5f9')
            .style('stroke-width', 0.5);
    }, [data, dimensions]);

    return (
        <div ref={containerRef} className={`w-full bg-white rounded-lg shadow p-4 mb-6 transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ border: 'none', position: 'relative' }}>
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="overflow-visible"
                style={{ border: 'none' }}
            />
            {tooltip.visible && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltip.x,
                        top: tooltip.y,
                        background: 'rgba(37,99,235,0.95)',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.95rem',
                        pointerEvents: 'none',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                    }}
                >
                    <div><b>{tooltip.value?.toFixed(2)} dB</b></div>
                    <div style={{ fontSize: '0.85em', opacity: 0.85 }}>{tooltip.time ? d3.timeFormat('%H:%M')(tooltip.time) : ''}</div>
                </div>
            )}
        </div>
    );
}
