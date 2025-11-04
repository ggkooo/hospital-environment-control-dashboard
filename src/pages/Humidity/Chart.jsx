import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

export function HumidityChart({ data }) {
    const svgRef = useRef()
    const containerRef = useRef()
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

    const padDataTo60Points = (originalData) => {
        const TARGET_POINTS = 60
        const now = new Date()

        if (!originalData || originalData.length === 0) {
            return Array.from({ length: TARGET_POINTS }, (_, i) => ({
                timestamp: new Date(now.getTime() - ((TARGET_POINTS - 1 - i) * 60 * 1000)),
                value: 0,
                min: 0,
                max: 0,
                isZero: true
            }))
        }

        if (originalData.length >= TARGET_POINTS) {
            return originalData.slice(-TARGET_POINTS).map(point => ({
                ...point,
                isZero: false
            }))
        }

        const missingPoints = TARGET_POINTS - originalData.length
        const oldestTimestamp = originalData[0].timestamp

        const paddedData = []

        for (let i = missingPoints - 1; i >= 0; i--) {
            paddedData.push({
                timestamp: new Date(oldestTimestamp.getTime() - ((i + 1) * 60 * 1000)),
                value: 0,
                min: 0,
                max: 0,
                isZero: true
            })
        }

        originalData.forEach(point => {
            paddedData.push({
                ...point,
                isZero: false
            })
        })

        return paddedData
    }

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth
                let containerHeight
                if (containerWidth < 640) {
                    containerHeight = Math.max(180, containerWidth * 0.4)
                } else if (containerWidth < 1024) {
                    containerHeight = Math.max(200, containerWidth * 0.35)
                } else {
                    containerHeight = Math.max(220, Math.min(280, containerWidth * 0.25))
                }
                setDimensions({
                    width: containerWidth,
                    height: containerHeight
                })
            }
        }
        const timeoutId = setTimeout(updateDimensions, 100)
        let resizeTimeout
        const debouncedResize = () => {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(updateDimensions, 150)
        }
        window.addEventListener('resize', debouncedResize)
        return () => {
            clearTimeout(timeoutId)
            clearTimeout(resizeTimeout)
            window.removeEventListener('resize', debouncedResize)
        }
    }, [])

    useEffect(() => {
        if (!data) return
        const paddedData = padDataTo60Points(data)
        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()
        const { width, height } = dimensions
        const margin = width < 640
            ? { top: 10, right: 15, bottom: 25, left: 35 }
            : { top: 15, right: 20, bottom: 30, left: 45 }
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom
        const xScale = d3.scaleTime()
            .domain(d3.extent(paddedData, d => d.timestamp))
            .range([0, innerWidth])
        const actualValues = paddedData.filter(d => !d.isZero).map(d => d.value)
        const yDomain = actualValues.length > 0
            ? d3.extent(actualValues)
            : [40, 60]
        const yScale = d3.scaleLinear()
            .domain(yDomain)
            .nice()
            .range([innerHeight, 0])
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
        const defs = svg.append('defs')
        const gradient = defs.append('linearGradient')
            .attr('id', 'humidity-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0).attr('y1', innerHeight)
            .attr('x2', 0).attr('y2', 0)
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#2563eb') // azul padronizado
            .attr('stop-opacity', 0.08)
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#2563eb') // azul padronizado
            .attr('stop-opacity', 0.18)
        const line = d3.line()
            .x(d => xScale(d.timestamp))
            .y(d => d.isZero ? innerHeight : yScale(d.value))
            .curve(d3.curveMonotoneX)
        const area = d3.area()
            .x(d => xScale(d.timestamp))
            .y0(innerHeight)
            .y1(d => d.isZero ? innerHeight : yScale(d.value))
            .curve(d3.curveMonotoneX)
        g.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale)
                .tickSize(-innerHeight)
                .tickFormat('')
            )
        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .tickSize(-innerWidth)
                .tickFormat('')
            )
        svg.selectAll('.grid line')
            .style('stroke', '#f1f5f9')
            .style('stroke-width', 0.5)
            .style('opacity', 0.5)
        svg.selectAll('.grid path')
            .style('stroke-width', 0)
        g.append('path')
            .datum(paddedData)
            .attr('fill', 'url(#humidity-gradient)')
            .attr('d', area)
        g.append('path')
            .datum(paddedData)
            .attr('fill', 'none')
            .attr('stroke', '#2563eb') // linha azul padronizada
            .attr('stroke-width', 1.25)
            .attr('d', line)
        g.selectAll('.dot')
            .data(paddedData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.timestamp))
            .attr('cy', d => d.isZero ? innerHeight : yScale(d.value))
            .attr('r', d => d.isZero ? 0.5 : 2)
            .attr('fill', d => d.isZero ? '#e2e8f0' : '#2563eb') // ponto azul padronizado
            .attr('stroke', 'none')
            .style('opacity', d => d.isZero ? 0.2 : 0.7)
            .on('mouseover', function(event, d) {
                if (d.isZero) return
                d3.select(this)
                    .style('opacity', 0.9)
                    .attr('r', 3.5)
                    .attr('fill', '#2563eb') // ponto azul padronizado
                const tooltip = d3.select('body').append('div')
                    .attr('class', 'humidity-tooltip')
                    .style('position', 'absolute')
                    .style('background', 'rgba(37, 99, 235, 0.95)') // tooltip azul padronizado
                    .style('color', 'white')
                    .style('padding', '6px 10px')
                    .style('border-radius', '6px')
                    .style('font-size', '11px')
                    .style('pointer-events', 'none')
                    .style('z-index', '1000')
                    .style('border', 'none')
                    .style('box-shadow', '0 4px 6px -1px rgba(16, 185, 129, 0.25)')
                tooltip.html(`
                    <div style="font-weight: 500;">${d.value.toFixed(2)}%</div>
                    <div style="opacity: 0.8; font-size: 10px;">${d.timestamp.toLocaleTimeString()}</div>
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
            })
            .on('mouseout', function(event, d) {
                if (d.isZero) return
                d3.select(this)
                    .style('opacity', 0.7)
                    .attr('r', 2)
                    .attr('fill', '#34d399')
                d3.selectAll('.humidity-tooltip').remove()
            })
        const xTickCount = width < 640 ? 4 : 6
        g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat('%H:%M'))
                .ticks(xTickCount)
            )
            .style('color', '#94a3b8')
            .selectAll('path, line')
            .style('stroke', '#f1f5f9')
            .style('stroke-width', 0.5)
        const yTickCount = width < 640 ? 3 : 4
        g.append('g')
            .call(d3.axisLeft(yScale)
                .ticks(yTickCount)
                .tickFormat(d => `${d.toFixed(2)}%`)
            )
            .style('color', '#94a3b8')
            .selectAll('path, line')
            .style('stroke', '#f1f5f9')
            .style('stroke-width', 0.5)
    }, [data, dimensions])

    return (
        <div ref={containerRef} className="w-full">
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="overflow-visible"
                style={{ border: 'none' }}
            />
        </div>
    )
}
