import { useState, useCallback } from 'react'
import { TYPES } from '../utils/sensorConstants'

export function useReportData() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const fetchAllSensorsDataByPeriod = async (startDate, endDate, granularity = 'minute', startTime = '00:00', endTime = '23:59') => {
        const apiKey = import.meta.env.VITE_API_KEY || ''

        let startDateTime, endDateTime

        if (granularity === 'minute') {
            startDateTime = new Date(startDate + 'T' + startTime + ':00').toISOString()
            endDateTime = new Date(endDate + 'T' + endTime + ':59').toISOString()
        } else {
            startDateTime = new Date(startDate + 'T00:00:00').toISOString()
            endDateTime = new Date(endDate + 'T23:59:59').toISOString()
        }

        const baseUrl = 'https://api.giordanoberwig.xyz/api/sensor-data'
        let endpoint = ''

        if (granularity === 'daily') {
            endpoint = `/daily/all`
        } else if (granularity === 'hourly') {
            endpoint = `/hourly/all`
        } else {
            return null
        }

        const url = `${baseUrl}${endpoint}?start=${startDateTime}&end=${endDateTime}&limit=1000&order=asc`


        try {
            const response = await fetch(url, {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })

            if (response.status === 429) {
                console.warn(`Rate limited for all sensors - too many requests`)
                throw new Error(`Rate limited: Too many requests to the API. Please wait a moment and try again.`)
            }

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Failed to fetch all sensors data: HTTP ${response.status} - ${response.statusText}. ${errorText || 'No additional error details'}`)
            }

            const json = await response.json()
            const allData = json?.data || {}

            const processedData = {}
            const filterStartDate = new Date(startDateTime)
            const filterEndDate = new Date(endDateTime)

            TYPES.forEach(sensorType => {
                const sensorData = allData[sensorType] || []

                if (sensorData.length === 0) {
                    processedData[sensorType] = []
                    return
                }

                let processed = []

                if (granularity === 'daily') {
                    processed = sensorData.map(item => {
                        const timestamp = item.day_date ? new Date(item.day_date + 'T12:00:00').toISOString() : new Date().toISOString()
                        return {
                            timestamp: timestamp,
                            value: parseFloat(item.avg_value) || 0,
                            min: parseFloat(item.min_value) || 0,
                            max: parseFloat(item.max_value) || 0,
                            count: parseInt(item.hour_count) || 1,
                            std_dev: parseFloat(item.std_dev) || 0,
                            daily_trend: parseFloat(item.daily_trend) || 0
                        }
                    }).filter(item => {
                        const itemDate = new Date(item.timestamp)
                        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())
                        const startDateOnly = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate())
                        const endDateOnly = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate())
                        return !isNaN(item.value) && itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly
                    })
                } else if (granularity === 'hourly') {
                    processed = sensorData.map(item => ({
                        timestamp: new Date(item.hour_timestamp).toISOString(),
                        value: parseFloat(item.avg_value) || 0,
                        min: parseFloat(item.min_value) || 0,
                        max: parseFloat(item.max_value) || 0,
                        count: parseInt(item.count) || 1
                    })).filter(item => {
                        const itemDate = new Date(item.timestamp)
                        return !isNaN(item.value) && itemDate >= filterStartDate && itemDate <= filterEndDate
                    })
                }

                processedData[sensorType] = processed
            })

            return processedData

        } catch (err) {
            console.error(`Error fetching all sensors data:`, err)
            throw new Error(`Failed to fetch all sensors data: ${err.message}`)
        }
    }

    const fetchSensorDataByPeriod = async (sensorType, startDate, endDate, granularity = 'minute', startTime = '00:00', endTime = '23:59') => {
        const apiKey = import.meta.env.VITE_API_KEY || ''

        let startDateTime, endDateTime

        if (granularity === 'minute') {
            startDateTime = new Date(startDate + 'T' + startTime + ':00').toISOString()
            endDateTime = new Date(endDate + 'T' + endTime + ':59').toISOString()
        } else {
            startDateTime = new Date(startDate + 'T00:00:00').toISOString()
            endDateTime = new Date(endDate + 'T23:59:59').toISOString()
        }

        const startDateObj = new Date(startDateTime)
        const endDateObj = new Date(endDateTime)

        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            throw new Error(`Invalid date format. Start: ${startDate}, End: ${endDate}`)
        }

        const startMs = new Date(startDateTime).getTime()
        const endMs = new Date(endDateTime).getTime()
        let totalIntervals, limitWithSafety

        if (granularity === 'minute') {
            totalIntervals = Math.ceil((endMs - startMs) / (1000 * 60))
            limitWithSafety = Math.max(totalIntervals + 100, 1000)
        } else if (granularity === 'hourly') {
            totalIntervals = Math.ceil((endMs - startMs) / (1000 * 60 * 60))
            limitWithSafety = Math.max(totalIntervals + 50, 500)
        } else if (granularity === 'daily') {
            totalIntervals = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24))
            limitWithSafety = Math.max(totalIntervals + 10, 100)
        } else {
            totalIntervals = Math.ceil((endMs - startMs) / (1000 * 60))
            limitWithSafety = Math.max(totalIntervals + 100, 1000)
        }

        const baseUrl = 'https://api.giordanoberwig.xyz/api/sensor-data'
        let endpoint = ''

        if (granularity === 'minute') {
            endpoint = `/minute/${sensorType}`
        } else if (granularity === 'hourly') {
            endpoint = `/hourly/${sensorType}`
        } else if (granularity === 'daily') {
            endpoint = `/daily/${sensorType}`
        } else {
            endpoint = `/minute/${sensorType}`
        }

        const url = `${baseUrl}${endpoint}?start=${startDateTime}&end=${endDateTime}&limit=${limitWithSafety}&order=asc`

        try {
            const response = await fetch(url, {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })

            if (response.status === 429) {
                console.warn(`Rate limited for ${sensorType} - too many requests`)
                throw new Error(`Rate limited: Too many requests to the API. Please wait a moment and try again.`)
            }

            if (!response.ok) {
                const errorText = await response.text()
                console.error(`API Error for ${sensorType}:`, {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText
                })
                throw new Error(`Failed to fetch ${sensorType} data: HTTP ${response.status} - ${response.statusText}. ${errorText || 'No additional error details'}`)
            }

            const json = await response.json()
            const dataArray = json?.data || []

            if (dataArray.length === 0) {
                console.warn(`No data returned from API for ${sensorType} in period ${startDateTime} to ${endDateTime}`)
                return []
            }

            let processedData = []

            const filterStartDate = new Date(startDateTime)
            const filterEndDate = new Date(endDateTime)

            if (granularity === 'minute') {
                processedData = dataArray.map(item => ({
                    timestamp: new Date(item.minute_timestamp).toISOString(),
                    value: parseFloat(item.avg_value) || 0,
                    min: parseFloat(item.min_value) || 0,
                    max: parseFloat(item.max_value) || 0,
                    count: parseInt(item.count) || 1
                })).filter(item => {
                    const itemDate = new Date(item.timestamp)
                    return !isNaN(item.value) && itemDate >= filterStartDate && itemDate <= filterEndDate
                })
            } else if (granularity === 'hourly') {
                processedData = dataArray.map(item => ({
                    timestamp: new Date(item.hour_timestamp).toISOString(),
                    value: parseFloat(item.avg_value) || 0,
                    min: parseFloat(item.min_value) || 0,
                    max: parseFloat(item.max_value) || 0,
                    count: parseInt(item.count) || 1
                })).filter(item => {
                    const itemDate = new Date(item.timestamp)
                    return !isNaN(item.value) && itemDate >= filterStartDate && itemDate <= filterEndDate
                })
            } else if (granularity === 'daily') {
                processedData = dataArray.map(item => {
                    const timestamp = item.day_date ? new Date(item.day_date + 'T12:00:00').toISOString() : new Date().toISOString()
                    return {
                        timestamp: timestamp,
                        value: parseFloat(item.avg_value) || 0,
                        min: parseFloat(item.min_value) || 0,
                        max: parseFloat(item.max_value) || 0,
                        count: parseInt(item.hour_count) || 1,
                        std_dev: parseFloat(item.std_dev) || 0,
                        daily_trend: parseFloat(item.daily_trend) || 0
                    }
                }).filter(item => {
                    const itemDate = new Date(item.timestamp)
                    const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())
                    const startDateOnly = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate())
                    const endDateOnly = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate())
                    return !isNaN(item.value) && itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly
                })
            } else {
                processedData = dataArray.map(item => ({
                    timestamp: new Date(item.minute_timestamp).toISOString(),
                    value: parseFloat(item.avg_value) || 0,
                    min: parseFloat(item.min_value) || 0,
                    max: parseFloat(item.max_value) || 0,
                    count: parseInt(item.count) || 1
                })).filter(item => {
                    const itemDate = new Date(item.timestamp)
                    return !isNaN(item.value) && itemDate >= filterStartDate && itemDate <= filterEndDate
                })
            }

            return processedData

        } catch (err) {
            console.error(`Error fetching ${sensorType} data:`, err)
            throw new Error(`Failed to fetch ${sensorType} data: ${err.message}`)
        }
    }

    const fetchReportData = useCallback(async (startDate, endDate, dataType, granularity = 'minute', startTime = '00:00', endTime = '23:59') => {
        setLoading(true)
        setError(null)

        try {
            const startDateTime = new Date(startDate + 'T00:00:00')
            const endDateTime = new Date(endDate + 'T23:59:59')
            const now = new Date()

            if (startDateTime > now) {
                throw new Error('Start date cannot be in the future. Please select a date that has already occurred.')
            }

            if (endDateTime > now) {
                console.warn('End date is in the future, adjusting to current time')
            }

            const periodDays = (endDateTime - startDateTime) / (1000 * 60 * 60 * 24)
            if (periodDays > 365) {
                console.warn('Selected period is longer than 1 year, this may result in large data sets')
            }

            let reportData = {}
            let results = []

            if (dataType === 'all') {

                if (granularity === 'daily' || granularity === 'hourly') {
                    try {
                        const allSensorsData = await fetchAllSensorsDataByPeriod(startDate, endDate, granularity, startTime, endTime)

                        if (allSensorsData) {
                            results = TYPES.map(sensorType => ({
                                sensorType,
                                data: allSensorsData[sensorType] || [],
                                success: true
                            }))

                            results.forEach(({ sensorType, data }) => {
                                reportData[sensorType] = data
                            })
                        }
                    } catch (err) {
                        console.warn('Failed to use /all endpoint, falling back to individual requests:', err.message)
                    }
                }

                if (results.length === 0) {

                    for (const [index, sensorType] of TYPES.entries()) {
                        try {
                            if (index > 0) {
                                await delay(1000)
                            }

                            const data = await fetchSensorDataByPeriod(sensorType, startDate, endDate, granularity, startTime, endTime)
                            results.push({ sensorType, data, success: true })
                            reportData[sensorType] = data
                        } catch (err) {
                            console.error(`✗ Failed to fetch data for ${sensorType}:`, err)
                            results.push({ sensorType, data: [], success: false, error: err.message })
                            reportData[sensorType] = []

                            if (err.message.includes('Rate limited')) {
                                await delay(3000)
                            }
                        }
                    }
                }

                const failed = results.filter(r => !r.success)

                if (failed.length > 0) {
                    console.warn(`Failed to fetch data for sensors: ${failed.map(f => f.sensorType).join(', ')}`)
                }

            } else {
                try {
                    const data = await fetchSensorDataByPeriod(dataType, startDate, endDate, granularity, startTime, endTime)
                    reportData[dataType] = data
                    results = [{ sensorType: dataType, data, success: true }]
                } catch (err) {
                    console.error(`✗ Failed to fetch data for ${dataType}:`, err)
                    reportData[dataType] = []
                    results = [{ sensorType: dataType, data: [], success: false, error: err.message }]
                }
            }

            const totalDataPoints = Object.values(reportData).reduce((sum, data) => sum + data.length, 0)
            const sensorsWithData = Object.entries(reportData).filter(([, data]) => data.length > 0)

            if (totalDataPoints === 0) {
                const periodInfo = `${startDate} to ${endDate}`
                const sensorInfo = dataType === 'all' ? 'all sensors' : dataType

                const failedSensors = Object.entries(reportData).filter(([, data]) => data.length === 0)

                let errorDetails = ''
                if (dataType === 'all') {
                    const failedResults = results.filter(r => !r.success)
                    if (failedResults.length > 0) {
                        errorDetails = ` Sensors with errors: ${failedResults.map(f => `${f.sensorType} (${f.error})`).join(', ')}.`
                    }
                }

                console.error('No data found - Debug info:', {
                    periodInfo,
                    sensorInfo,
                    granularity,
                    failedSensors: failedSensors.map(([sensor]) => sensor),
                    errors: dataType === 'all' ? results.filter(r => !r.success).map(f => ({ sensor: f.sensorType, error: f.error })) : []
                })

                let suggestionText = ''
                try {
                    const apiKey = import.meta.env.VITE_API_KEY || ''
                    const testUrl = 'https://api.giordanoberwig.xyz/api/sensor-data/daily/all?limit=5&order=desc'

                    fetch(testUrl, {
                        headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
                    }).then(response => {
                        if (response.ok) {
                            return response.json()
                        }
                    }).then(json => {
                        if (json?.data) {
                            const availableDates = new Set()
                            Object.values(json.data).forEach(sensorData => {
                                if (Array.isArray(sensorData)) {
                                    sensorData.forEach(item => {
                                        if (item.day_date) {
                                            availableDates.add(item.day_date)
                                        }
                                    })
                                }
                            })
                            if (availableDates.size > 0) {
                                const sortedDates = Array.from(availableDates).sort().reverse()
                                suggestionText = ` Recent available dates: ${sortedDates.slice(0, 5).join(', ')}`
                            }
                        }
                    }).catch(err => {
                        console.warn('Could not fetch available dates:', err)
                    })
                } catch (err) {
                    console.warn('Error checking available dates:', err)
                }

                throw new Error(
                    `No data found for ${sensorInfo} in period ${periodInfo} with ${granularity} granularity.${errorDetails}${suggestionText} ` +
                    `This could be due to: 1) No sensor readings in this time range, ` +
                    `2) API connectivity issues, or 3) Incorrect date/time selection. ` +
                    `Try selecting a different time period (use the "Buscar Dados" button to find available periods) or check if the sensors were active during this time. ` +
                    `Check the browser console for detailed API debugging information.`
                )
            }

            if (sensorsWithData.length === 0) {
                throw new Error(`No sensors returned data for the selected period. Check sensor availability and API connectivity.`)
            }


            setLoading(false)
            return reportData

        } catch (err) {
            console.error('Error in fetchReportData:', err)
            setError(err.message)
            setLoading(false)
            throw err
        }
    }, [])

    const testApiConnectivity = useCallback(async () => {
        const apiKey = import.meta.env.VITE_API_KEY || ''
        const testUrl = 'https://api.giordanoberwig.xyz/api/sensor-data/minute/temperature?limit=1&order=desc'

        try {
            const response = await fetch(testUrl, {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })

            if (response.status === 429) {
                console.warn('✗ API rate limited - too many requests')
                alert('API is temporarily rate limited. Please wait a moment and try again.')
                return false
            }

            if (!response.ok) {
                throw new Error(`API test failed: HTTP ${response.status} - ${response.statusText}`)
            }

            const json = await response.json()

            return true
        } catch (error) {
            console.error('✗ API connectivity test failed:', error)
            return false
        }
    }, [])

    const fetchAvailableDays = useCallback(async () => {
        try {

            const availableDays = []
            const today = new Date()

            for (let i = 0; i < 90; i++) {
                const date = new Date()
                date.setDate(today.getDate() - i)
                availableDays.push(date.toISOString().split('T')[0])
            }

            return availableDays

        } catch (error) {
            console.error('Failed to generate available days:', error)

            const fallbackDays = []
            for (let i = 0; i < 30; i++) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                fallbackDays.push(date.toISOString().split('T')[0])
            }

            return fallbackDays
        }
    }, [])

    const suggestAlternativePeriods = useCallback(async () => {
        const apiKey = import.meta.env.VITE_API_KEY || ''
        const suggestions = []

        try {
            const testUrl = 'https://api.giordanoberwig.xyz/api/sensor-data/daily/all?limit=10&order=desc'

            const response = await fetch(testUrl, {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })

            if (response.ok) {
                const json = await response.json()
                if (json?.data) {
                    const availableDates = new Set()

                    Object.values(json.data).forEach(sensorData => {
                        if (Array.isArray(sensorData)) {
                            sensorData.forEach(item => {
                                if (item.day_date) {
                                    availableDates.add(item.day_date)
                                }
                            })
                        }
                    })

                    if (availableDates.size > 0) {
                        const sortedDates = Array.from(availableDates).sort().reverse()

                        if (sortedDates.length >= 1) {
                            suggestions.push({
                                period: 'Último dia disponível',
                                startDate: sortedDates[0],
                                endDate: sortedDates[0],
                                hasData: true
                            })
                        }

                        if (sortedDates.length >= 3) {
                            suggestions.push({
                                period: 'Últimos 3 dias disponíveis',
                                startDate: sortedDates[2],
                                endDate: sortedDates[0],
                                hasData: true
                            })
                        }

                        if (sortedDates.length >= 7) {
                            suggestions.push({
                                period: 'Últimos 7 dias disponíveis',
                                startDate: sortedDates[6],
                                endDate: sortedDates[0],
                                hasData: true
                            })
                        }

                        if (sortedDates.length >= 2) {
                            suggestions.push({
                                period: `Todos os dados disponíveis (${sortedDates.length} dias)`,
                                startDate: sortedDates[sortedDates.length - 1],
                                endDate: sortedDates[0],
                                hasData: true
                            })
                        }
                    }
                }
            }

            if (suggestions.length === 0) {
                const testPeriods = [
                    { days: 1, name: 'Last 24 hours' },
                    { days: 3, name: 'Last 3 days' },
                    { days: 7, name: 'Last 7 days' }
                ]

                for (const [index, period] of testPeriods.entries()) {
                    try {
                        if (index > 0) {
                            await delay(500)
                        }

                        const endDate = new Date()
                        const startDate = new Date()
                        startDate.setDate(startDate.getDate() - period.days)

                        const startDateStr = startDate.toISOString().split('T')[0]
                        const endDateStr = endDate.toISOString().split('T')[0]

                        suggestions.push({
                            period: period.name,
                            startDate: startDateStr,
                            endDate: endDateStr,
                            hasData: false
                        })
                    } catch (error) {
                        console.warn(`Failed to create period ${period.name}:`, error)
                    }
                }
            }

            return suggestions

        } catch (error) {
            console.error('Failed to suggest alternative periods:', error)
            return []
        }
    }, [])

    return {
        fetchReportData,
        loading,
        error,
        testApiConnectivity,
        fetchAvailableDays,
        suggestAlternativePeriods
    }
}
