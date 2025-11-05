import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export function NoiseChart({ data }) {
    const svgRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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
        updateDimensions();
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedResize);
        };
    }, []);

    useEffect(() => {
        const chartData = padDataTo60Points(data);
        // ...d3 chart logic (similar to other charts, but for noise)
        // For now, just clear svg
        if (svgRef.current) {
            d3.select(svgRef.current).selectAll('*').remove();
            // Implement chart drawing here
        }
    }, [data, dimensions]);

    return (
        <div ref={containerRef} className="w-full h-96 bg-white rounded-lg shadow p-4 mb-6">
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
        </div>
    );
}

export function NoiseStats({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-4" style={{ border: 'none' }}>
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const validData = data.filter(d => d.value !== null && d.value !== undefined);
    const sortedValidData = validData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const currentNoise = sortedValidData.length > 0 ? sortedValidData[sortedValidData.length - 1].value : null;
    const minNoise = sortedValidData.length > 0 ? Math.min(...sortedValidData.map(d => d.value)) : null;
    const maxNoise = sortedValidData.length > 0 ? Math.max(...sortedValidData.map(d => d.value)) : null;
    const avgNoise = sortedValidData.length > 0 ? (sortedValidData.reduce((sum, d) => sum + d.value, 0) / sortedValidData.length) : null;

    const stats = [
        {
            label: 'Current',
            value: currentNoise !== null ? currentNoise.toFixed(2) : '--',
            unit: 'dB',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: `Average (${validData.length} min)`,
            value: avgNoise !== null ? avgNoise.toFixed(2) : '--',
            unit: 'dB',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Minimum',
            value: minNoise !== null ? minNoise.toFixed(2) : '--',
            unit: 'dB',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
        },
        {
            label: 'Maximum',
            value: maxNoise !== null ? maxNoise.toFixed(2) : '--',
            unit: 'dB',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, idx) => (
                <div key={idx} className={`rounded-lg shadow-sm p-4 ${stat.bgColor}`} style={{ border: 'none' }}>
                    <div className="text-sm font-medium mb-2">{stat.label}</div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value} <span className="text-base font-normal">{stat.unit}</span></div>
                </div>
            ))}
        </div>
    );
}
