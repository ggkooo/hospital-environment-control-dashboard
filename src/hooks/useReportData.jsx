import { useState, useCallback } from 'react'
import { TYPES } from '../utils/sensorConstants'

export function useReportData() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Utility function to add delay between API calls
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    // Função especializada para buscar dados de todos os sensores usando endpoint /all
    const fetchAllSensorsDataByPeriod = async (startDate, endDate, granularity = 'minute', startTime = '00:00', endTime = '23:59') => {
        const apiKey = import.meta.env.VITE_API_KEY || ''

        // Converter datas para o formato correto da API
        let startDateTime, endDateTime

        if (granularity === 'minute') {
            startDateTime = new Date(startDate + 'T' + startTime + ':00').toISOString()
            endDateTime = new Date(endDate + 'T' + endTime + ':59').toISOString()
        } else {
            startDateTime = new Date(startDate + 'T00:00:00').toISOString()
            endDateTime = new Date(endDate + 'T23:59:59').toISOString()
        }

        console.log(`📅 Date validation for all sensors:`, {
            inputDates: { startDate, endDate, granularity },
            convertedDates: { startDateTime, endDateTime }
        })

        // Usar endpoint /all para granularidades hourly e daily
        const baseUrl = 'https://api.giordanoberwig.xyz/api/sensor-data'
        let endpoint = ''

        if (granularity === 'daily') {
            endpoint = `/daily/all`
        } else if (granularity === 'hourly') {
            endpoint = `/hourly/all`
        } else {
            // Para minute, buscar individualmente
            return null // Indica que deve usar a função individual
        }

        const url = `${baseUrl}${endpoint}?start=${startDateTime}&end=${endDateTime}&limit=1000&order=asc`

        console.log(`Fetching all sensors data (${granularity}-level) from:`, url)

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

            console.log(`Raw API response for all sensors (${granularity}):`, {
                status: response.status,
                sensorsFound: Object.keys(allData),
                totalData: Object.values(allData).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
            })

            // Processar dados para cada sensor
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

                console.log(`Processed ${sensorType} from /all endpoint:`, {
                    originalCount: sensorData.length,
                    filteredCount: processed.length,
                    sampleData: processed.slice(0, 2)
                })
            })

            return processedData

        } catch (err) {
            console.error(`Error fetching all sensors data:`, err)
            throw new Error(`Failed to fetch all sensors data: ${err.message}`)
        }
    }

    // Função para buscar dados de um sensor específico por período
    const fetchSensorDataByPeriod = async (sensorType, startDate, endDate, granularity = 'minute', startTime = '00:00', endTime = '23:59') => {
        const apiKey = import.meta.env.VITE_API_KEY || ''

        // Converter datas para o formato correto da API
        let startDateTime, endDateTime

        if (granularity === 'minute') {
            // Para minute, usar os horários específicos
            startDateTime = new Date(startDate + 'T' + startTime + ':00').toISOString()
            endDateTime = new Date(endDate + 'T' + endTime + ':59').toISOString()
        } else {
            // Para hourly e daily, usar o dia completo
            startDateTime = new Date(startDate + 'T00:00:00').toISOString()
            endDateTime = new Date(endDate + 'T23:59:59').toISOString()
        }

        // Validar datas
        const startDateObj = new Date(startDateTime)
        const endDateObj = new Date(endDateTime)

        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            throw new Error(`Invalid date format. Start: ${startDate}, End: ${endDate}`)
        }

        console.log(`📅 Date validation for ${sensorType}:`, {
            inputDates: { startDate, endDate, granularity },
            convertedDates: { startDateTime, endDateTime },
            isValidStart: !isNaN(startDateObj.getTime()),
            isValidEnd: !isNaN(endDateObj.getTime())
        })

        // Calcular o limite baseado na granularidade
        const startMs = new Date(startDateTime).getTime()
        const endMs = new Date(endDateTime).getTime()
        let totalIntervals, limitWithSafety

        if (granularity === 'minute') {
            totalIntervals = Math.ceil((endMs - startMs) / (1000 * 60)) // Minutos
            limitWithSafety = Math.max(totalIntervals + 100, 1000)
        } else if (granularity === 'hourly') {
            totalIntervals = Math.ceil((endMs - startMs) / (1000 * 60 * 60)) // Horas
            limitWithSafety = Math.max(totalIntervals + 50, 500)
        } else if (granularity === 'daily') {
            totalIntervals = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) // Dias
            limitWithSafety = Math.max(totalIntervals + 10, 100)
        } else {
            // Fallback
            totalIntervals = Math.ceil((endMs - startMs) / (1000 * 60)) // Minutos
            limitWithSafety = Math.max(totalIntervals + 100, 1000)
        }

        console.log(`Calculated period: ${totalIntervals} ${granularity} intervals, using limit: ${limitWithSafety}`)

        // Usar as rotas da API baseado na granularidade
        const baseUrl = 'https://api.giordanoberwig.xyz/api/sensor-data'
        let endpoint = ''

        if (granularity === 'minute') {
            endpoint = `/minute/${sensorType}`
        } else if (granularity === 'hourly') {
            endpoint = `/hourly/${sensorType}`
        } else if (granularity === 'daily') {
            endpoint = `/daily/${sensorType}`
        } else {
            // Fallback para minute
            endpoint = `/minute/${sensorType}`
        }

        const url = `${baseUrl}${endpoint}?start=${startDateTime}&end=${endDateTime}&limit=${limitWithSafety}&order=asc`

        console.log(`Fetching ${sensorType} data (${granularity}-level) from:`, url)

        try {
            const response = await fetch(url, {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })

            console.log(`API Response for ${sensorType}:`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                url: url
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

            console.log(`Raw API response for ${sensorType} (${granularity}):`, {
                status: response.status,
                dataLength: dataArray.length,
                hasData: json?.data ? 'yes' : 'no',
                firstItem: dataArray[0],
                lastItem: dataArray[dataArray.length - 1],
                url: url
            })

            if (dataArray.length === 0) {
                console.warn(`No data returned from API for ${sensorType} in period ${startDateTime} to ${endDateTime}`)
                return []
            }

            // Formatar dados baseado na granularidade
            let processedData = []

            // Datas para filtrar o período correto
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
                    // Para dados daily, usar day_date e hour_count
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
                // Fallback para minute
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

            console.log(`Processed ${sensorType} data (${granularity}):`, {
                originalCount: dataArray.length,
                filteredCount: processedData.length,
                period: `${startDateTime} to ${endDateTime}`,
                sampleData: processedData.slice(0, 3),
                dateRange: processedData.length > 0 ? {
                    first: processedData[0]?.timestamp,
                    last: processedData[processedData.length - 1]?.timestamp
                } : null
            })

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
            // Validar período selecionado
            const startDateTime = new Date(startDate + 'T00:00:00')
            const endDateTime = new Date(endDate + 'T23:59:59')
            const now = new Date()

            if (startDateTime > now) {
                throw new Error('Start date cannot be in the future. Please select a date that has already occurred.')
            }

            if (endDateTime > now) {
                console.warn('End date is in the future, adjusting to current time')
                // Não bloquear, apenas avisar
            }

            const periodDays = (endDateTime - startDateTime) / (1000 * 60 * 60 * 24)
            if (periodDays > 365) {
                console.warn('Selected period is longer than 1 year, this may result in large data sets')
            }

            console.log('Fetching report data with params:', {
                startDate,
                endDate,
                dataType,
                granularity,
                periodDays: Math.round(periodDays * 100) / 100
            })

            let reportData = {}
            let results = [] // Store results for error reporting

            if (dataType === 'all') {
                // Buscar dados para todos os tipos de sensores
                console.log('Fetching data for all sensor types...')

                // Tentar usar endpoint /all primeiro para granularidades hourly/daily
                if (granularity === 'daily' || granularity === 'hourly') {
                    try {
                        console.log(`Using /all endpoint for ${granularity} granularity...`)
                        const allSensorsData = await fetchAllSensorsDataByPeriod(startDate, endDate, granularity, startTime, endTime)

                        if (allSensorsData) {
                            // Converter para o formato esperado
                            results = TYPES.map(sensorType => ({
                                sensorType,
                                data: allSensorsData[sensorType] || [],
                                success: true
                            }))

                            results.forEach(({ sensorType, data }) => {
                                reportData[sensorType] = data
                                console.log(`✓ ${sensorType}: ${data.length} data points from /all endpoint`)
                            })
                        }
                    } catch (err) {
                        console.warn('Failed to use /all endpoint, falling back to individual requests:', err.message)
                        // Se falhar, usar método individual abaixo
                    }
                }

                // Se não usou /all endpoint ou falhou, buscar individualmente
                if (results.length === 0) {
                    console.log('Fetching sensors individually with delays...')

                    // Fetch sensors sequentially with delay to prevent rate limiting
                    for (const [index, sensorType] of TYPES.entries()) {
                        try {
                            // Add delay between requests (except for the first one)
                            if (index > 0) {
                                console.log(`Waiting 1 second before fetching ${sensorType}...`)
                                await delay(1000) // 1 second delay between requests
                            }

                            console.log(`Starting fetch for ${sensorType}... (${index + 1}/${TYPES.length})`)
                            const data = await fetchSensorDataByPeriod(sensorType, startDate, endDate, granularity, startTime, endTime)
                            console.log(`✓ ${sensorType}: ${data.length} data points`)
                            results.push({ sensorType, data, success: true })
                            reportData[sensorType] = data
                        } catch (err) {
                            console.error(`✗ Failed to fetch data for ${sensorType}:`, err)
                            results.push({ sensorType, data: [], success: false, error: err.message })
                            reportData[sensorType] = []

                            // If rate limited, add extra delay before next request
                            if (err.message.includes('Rate limited')) {
                                console.log('Rate limited detected, adding extra delay...')
                                await delay(3000) // 3 second delay after rate limit
                            }
                        }
                    }
                }

                // Separar sucessos e falhas
                const failed = results.filter(r => !r.success)

                if (failed.length > 0) {
                    console.warn(`Failed to fetch data for sensors: ${failed.map(f => f.sensorType).join(', ')}`)
                }

            } else {
                // Buscar dados apenas para o tipo selecionado
                console.log(`Fetching data for sensor type: ${dataType}`)
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

            // Verificar se temos dados
            const totalDataPoints = Object.values(reportData).reduce((sum, data) => sum + data.length, 0)
            const sensorsWithData = Object.entries(reportData).filter(([, data]) => data.length > 0)

            console.log(`Data summary:`, {
                totalDataPoints,
                sensorsRequested: dataType === 'all' ? TYPES.length : 1,
                sensorsWithData: sensorsWithData.length,
                breakdown: Object.entries(reportData).map(([sensor, data]) => ({
                    sensor,
                    count: data.length
                }))
            })

            if (totalDataPoints === 0) {
                // Fornecer mais detalhes sobre por que não há dados
                const periodInfo = `${startDate} to ${endDate}`
                const sensorInfo = dataType === 'all' ? 'all sensors' : dataType

                // Adicionar informações de debugging
                const failedSensors = Object.entries(reportData).filter(([, data]) => data.length === 0)

                // Get failed sensors with error messages if we have them
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

                // Tentar sugerir um período com dados disponíveis
                let suggestionText = ''
                try {
                    // Fazer uma chamada rápida para ver quais dados estão disponíveis
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
                                console.log('Available dates found in API:', sortedDates.slice(0, 5))
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

            // Log de sucesso
            console.log(`Successfully fetched data for ${sensorsWithData.length} sensor(s), total: ${totalDataPoints} data points`)

            setLoading(false)
            return reportData

        } catch (err) {
            console.error('Error in fetchReportData:', err)
            setError(err.message)
            setLoading(false)
            throw err
        }
    }, [])

    // Função para testar conectividade da API
    const testApiConnectivity = useCallback(async () => {
        const apiKey = import.meta.env.VITE_API_KEY || ''
        const testUrl = 'https://api.giordanoberwig.xyz/api/sensor-data/minute/temperature?limit=1&order=desc'

        try {
            console.log('Testing API connectivity...')
            const response = await fetch(testUrl, {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })

            console.log('API Response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
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
            console.log('✓ API connectivity test successful:', {
                status: response.status,
                hasData: !!json?.data,
                dataCount: json?.data?.length || 0
            })

            return true
        } catch (error) {
            console.error('✗ API connectivity test failed:', error)
            return false
        }
    }, [])

    // Função simplificada para gerar range de datas disponíveis
    const fetchAvailableDays = useCallback(async () => {
        try {
            console.log('Generating available date range...')

            // Gerar um range dos últimos 90 dias como padrão
            // Isso evita chamadas API desnecessárias e permite ao usuário selecionar qualquer data
            const availableDays = []
            const today = new Date()

            for (let i = 0; i < 90; i++) {
                const date = new Date()
                date.setDate(today.getDate() - i)
                availableDays.push(date.toISOString().split('T')[0])
            }

            console.log(`Generated ${availableDays.length} available days from ${availableDays[availableDays.length - 1]} to ${availableDays[0]}`)
            return availableDays

        } catch (error) {
            console.error('Failed to generate available days:', error)

            // Fallback mínimo dos últimos 30 dias
            const fallbackDays = []
            for (let i = 0; i < 30; i++) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                fallbackDays.push(date.toISOString().split('T')[0])
            }

            return fallbackDays
        }
    }, [])

    // Função para sugerir períodos alternativos com dados
    const suggestAlternativePeriods = useCallback(async () => {
        const apiKey = import.meta.env.VITE_API_KEY || ''
        const suggestions = []

        try {
            console.log('Searching for available data periods...')

            // Primeiro, buscar dados reais da API para ver quais datas estão disponíveis
            const testUrl = 'https://api.giordanoberwig.xyz/api/sensor-data/daily/all?limit=10&order=desc'

            const response = await fetch(testUrl, {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })

            if (response.ok) {
                const json = await response.json()
                if (json?.data) {
                    const availableDates = new Set()

                    // Extrair datas de todos os sensores
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
                        console.log('Available dates found:', sortedDates)

                        // Criar sugestões baseadas nas datas reais disponíveis
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

            // Se não conseguiu dados da API, usar períodos padrão
            if (suggestions.length === 0) {
                console.log('Fallback to standard periods...')
                const testPeriods = [
                    { days: 1, name: 'Last 24 hours' },
                    { days: 3, name: 'Last 3 days' },
                    { days: 7, name: 'Last 7 days' }
                ]

                for (const [index, period] of testPeriods.entries()) {
                    try {
                        // Add delay between requests to prevent rate limiting
                        if (index > 0) {
                            await delay(500) // 500ms delay between period tests
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
                            hasData: false // Não verificamos se tem dados
                        })
                    } catch (error) {
                        console.warn(`Failed to create period ${period.name}:`, error)
                    }
                }
            }

            console.log('Available data periods found:', suggestions)
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
