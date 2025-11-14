import { useState, useEffect } from 'react'
import { TYPES, ICON_LABEL_MAP } from '../../../utils/sensorConstants'
import { FaCalendarAlt, FaChevronDown, FaFileDownload, FaFilter, FaSpinner, FaClock } from 'react-icons/fa'
import { Sidebar } from "../../../components/Sidebar/index.jsx"
import { Header } from "../../../components/Header/index.jsx"
import { useReportData } from '../../../hooks/useReportData.jsx'
import { generatePDFReport } from '../../../utils/pdfGenerator.js'

export function ReportsManager() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedDataType, setSelectedDataType] = useState('all')
    const [selectedGranularity, setSelectedGranularity] = useState('minute')
    const [selectedArea, setSelectedArea] = useState('pharmacy')
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [startTime, setStartTime] = useState('00:00')
    const [endTime, setEndTime] = useState('23:59')
    const [isDataTypeOpen, setIsDataTypeOpen] = useState(false)
    const [isGranularityOpen, setIsGranularityOpen] = useState(false)
    const [isAreaOpen, setIsAreaOpen] = useState(false)
    const [isLanguageOpen, setIsLanguageOpen] = useState(false)
    const [availableDays, setAvailableDays] = useState([])
    const { fetchReportData, loading, testApiConnectivity, fetchAvailableDays, suggestAlternativePeriods } = useReportData()

    const handleTestConnectivity = async () => {
        const isConnected = await testApiConnectivity()
        if (isConnected) {
            alert('✓ API connectivity test successful! The sensor data API is responding correctly.')
        } else {
            alert('✗ API connectivity test failed. Please check your internet connection and try again later.')
        }
    }

    const handleSuggestAlternatives = async () => {
        console.log('Searching for alternative date periods with available data...')
        const suggestions = await suggestAlternativePeriods()

        if (suggestions.length > 0) {
            const message = `Found data in these periods:\n\n${suggestions.map(s => 
                `${s.period}: ${s.startDate} to ${s.endDate}`
            ).join('\n')}\n\nWould you like to use the most recent period (${suggestions[0].period})?`

            if (confirm(message)) {
                setStartDate(suggestions[0].startDate)
                setEndDate(suggestions[0].endDate)
                console.log(`Applied suggested period: ${suggestions[0].startDate} to ${suggestions[0].endDate}`)
            }
        } else {
            alert('No recent data periods found. The sensors may not be active or there may be API connectivity issues.')
        }
    }

    const handleDebugInfo = () => {
        const debugInfo = {
            selectedDates: { startDate, endDate },
            selectedSettings: {
                dataType: selectedDataType,
                granularity: selectedGranularity,
                timeRange: `${startTime} - ${endTime}`
            },
            availableDays: availableDays.length,
            recentAvailableDays: availableDays.slice(0, 5),
            currentDateTime: new Date().toISOString(),
            apiBaseUrl: 'https://api.giordanoberwig.xyz/api/sensor-data',
            hasApiKey: !!import.meta.env.VITE_API_KEY
        }

        console.log('🔍 Debug Information:', debugInfo)
        alert(`Debug info logged to console. Available data days: ${availableDays.length}. Check browser console for full details.`)
    }

    // Função para formatar data corretamente sem problemas de timezone
    const formatDateBR = (dateString) => {
        const date = new Date(dateString + 'T00:00:00')
        return date.toLocaleDateString('pt-BR')
    }

    const dataTypeOptions = [
        { value: 'all', label: 'All Data Types' },
        ...TYPES.map(type => ({
            value: type,
            label: ICON_LABEL_MAP[type]
        }))
    ]

    const granularityOptions = [
        { value: 'minute', label: 'Per Minute', description: 'Detailed minute-by-minute data', disabled: false },
        { value: 'hourly', label: 'Per Hour', description: 'Hourly aggregated data', disabled: false },
        { value: 'daily', label: 'Per Day', description: 'Daily aggregated data', disabled: false },
        { value: 'week', label: 'Per Week', description: 'Weekly aggregated data (frontend aggregation)', disabled: true },
        { value: 'month', label: 'Per Month', description: 'Monthly aggregated data (frontend aggregation)', disabled: true }
    ]

    const areaOptions = [
        { value: 'pharmacy', label: 'Pharmacy', enabled: true },
        { value: 'icu', label: 'ICU', enabled: false },
        { value: 'reception', label: 'Reception', enabled: false },
        { value: 'emergency', label: 'Emergency Room', enabled: false },
        { value: 'surgery', label: 'Surgery', enabled: false },
        { value: 'laboratory', label: 'Laboratory', enabled: false }
    ]

    const languageOptions = [
        { value: 'en', label: 'English', flag: '🇺🇸' },
        { value: 'de', label: 'German (Deutsch)', flag: '🇩🇪' },
        { value: 'tr', label: 'Turkish (Türkçe)', flag: '🇹🇷' },
        { value: 'pt-br', label: 'Portuguese Brazil (Português)', flag: '🇧🇷' },
        { value: 'es', label: 'Spanish (Español)', flag: '🇪🇸' }
    ]

    useEffect(() => {
        const initializeDates = async () => {
            const days = await fetchAvailableDays()
            setAvailableDays(days)

            // Auto-selecionar ontem como data de início e hoje como data de fim se não há datas selecionadas
            if (!startDate && !endDate) {
                const today = new Date()
                const yesterday = new Date()
                yesterday.setDate(today.getDate() - 1)

                setStartDate(yesterday.toISOString().split('T')[0])
                setEndDate(yesterday.toISOString().split('T')[0]) // Mesmo dia para começar
                console.log(`Auto-selected yesterday: ${yesterday.toISOString().split('T')[0]}`)
            }
        }

        // Only fetch once on component mount
        initializeDates()
    }, [fetchAvailableDays])

    // Função para definir períodos de data comuns
    const setQuickDateRange = (days) => {
        const endDate = new Date()
        const startDate = new Date()

        if (days === 0) {
            // Hoje
            setStartDate(endDate.toISOString().split('T')[0])
            setEndDate(endDate.toISOString().split('T')[0])
        } else {
            // Período de X dias atrás até ontem
            startDate.setDate(endDate.getDate() - days)
            const yesterday = new Date()
            yesterday.setDate(endDate.getDate() - 1)

            setStartDate(startDate.toISOString().split('T')[0])
            setEndDate(yesterday.toISOString().split('T')[0])
        }
    }

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            alert('Por favor, selecione as datas de início e fim')
            return
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('A data de início deve ser anterior ou igual à data de fim')
            return
        }

        // Verificar se as datas estão muito no futuro
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (new Date(startDate) > today) {
            alert('A data de início não pode ser no futuro. Selecione uma data que já ocorreu.')
            return
        }

        if (new Date(endDate) > today) {
            alert('A data de fim não pode ser no futuro. Selecione uma data que já ocorreu.')
            return
        }

        // Verificar período muito longo
        const daysDifference = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
        if (daysDifference > 90) {
            const confirm = window.confirm('Você selecionou um período de mais de 90 dias. Isso pode gerar um relatório muito grande e demorar para processar. Deseja continuar?')
            if (!confirm) return
        }

        // Validação adicional para horários quando granularidade é minute
        if (selectedGranularity === 'minute') {
            if (startDate === endDate && startTime >= endTime) {
                alert('Para o mesmo dia, o horário de início deve ser anterior ao horário de fim')
                return
            }
        }

        try {
            console.log('Iniciando busca de dados para o relatório...', {
                startDate,
                endDate,
                startTime: selectedGranularity === 'minute' ? startTime : undefined,
                endTime: selectedGranularity === 'minute' ? endTime : undefined,
                dataType: selectedDataType,
                granularity: selectedGranularity,
                periodDays: Math.round(daysDifference * 100) / 100
            })

            // Buscar dados do relatório com granularidade especificada
            const reportData = selectedGranularity === 'minute'
                ? await fetchReportData(startDate, endDate, selectedDataType, selectedGranularity, startTime, endTime)
                : await fetchReportData(startDate, endDate, selectedDataType, selectedGranularity)

            console.log('Gerando PDF com gráficos...')
            // Gerar PDF (agora com gráficos e estatísticas avançadas)
            const pdfParams = selectedGranularity === 'minute'
                ? [reportData, startDate, endDate, selectedDataType, selectedGranularity, selectedArea, selectedLanguage, startTime, endTime]
                : [reportData, startDate, endDate, selectedDataType, selectedGranularity, selectedArea, selectedLanguage]

            await generatePDFReport(...pdfParams)

        } catch (err) {
            console.error('Erro ao gerar relatório:', err)

            // Fornecer feedback específico baseado no tipo de erro
            let userMessage = 'Erro ao gerar relatório. Tente novamente.'
            let showAlternatives = false

            if (err.message.includes('No data found')) {
                userMessage = `Nenhum dado encontrado para o período selecionado (${formatDateBR(startDate)} - ${formatDateBR(endDate)}).

Sugestões:
• Tente um período mais recente (últimos dias)
• Verifique se os sensores estavam funcionando no período
• Tente selecionar "All Data Types" em vez de um sensor específico
• Use granularidade "hourly" ou "daily" para períodos maiores

Gostaria de buscar períodos com dados disponíveis?`

                showAlternatives = true
            } else if (err.message.includes('Failed to fetch')) {
                userMessage = `Erro de conexão: Não foi possível buscar os dados dos sensores.

Verifique:
• Sua conexão com a internet
• Disponibilidade do servidor da API
• Tente novamente em alguns momentos

Clique em "Test API" para verificar a conexão.`
            } else if (err.message.includes('Rate limited')) {
                userMessage = `API com limite de requisições: Muitas solicitações foram feitas para a API dos sensores.

Este é um problema temporário que se resolverá automaticamente. Por favor:
• Aguarde 1-2 minutos antes de tentar novamente
• Tente usar um período menor
• Considere usar granularidade "hourly" ou "daily" para períodos grandes

A API limita requisições para evitar sobrecarga.`
            } else if (err.message.includes('future')) {
                userMessage = `Seleção de data inválida: ${err.message}

Por favor, selecione datas que já ocorreram.`
            }

            if (showAlternatives) {
                const result = confirm(userMessage)
                if (result) {
                    await handleSuggestAlternatives()
                }
            } else {
                alert(userMessage)
            }
        }
    }

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header
                    title='Reports Manager'
                    description='Generate and download environmental data reports for analysis and compliance.'
                />

                <div className="max-w-4xl mx-auto">

                {/* Report Configuration Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FaFilter className="text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Report Configuration</h2>
                    </div>

                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${selectedGranularity === 'minute' ? 'xl:grid-cols-3' : 'xl:grid-cols-3'}`}>
                        {/* Start Date Picker */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Start Date {availableDays.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                        ({availableDays.length} days available)
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={availableDays.length > 0 ? availableDays[availableDays.length - 1] : '2020-01-01'}
                                    max={availableDays.length > 0 ? availableDays[0] : new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                />
                                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Selecione a data de início do período para o relatório
                            </div>
                        </div>

                        {/* End Date Picker */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || '2020-01-01'}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                />
                                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Selecione a data de fim do período para o relatório
                            </div>
                        </div>

                        {/* Time Range - Only shown when granularity is 'minute' */}
                        {selectedGranularity === 'minute' && (
                            <>
                                {/* Start Time */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Start Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        />
                                        <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                {/* End Time */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        End Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        />
                                        <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Data Type Select */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Data Type
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDataTypeOpen(!isDataTypeOpen)}
                                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-left flex items-center justify-between"
                                >
                                    <span className="text-gray-900">
                                        {dataTypeOptions.find(option => option.value === selectedDataType)?.label}
                                    </span>
                                    <FaChevronDown
                                        className={`text-gray-400 transition-transform duration-200 ${
                                            isDataTypeOpen ? 'transform rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {isDataTypeOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                        {dataTypeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedDataType(option.value)
                                                    setIsDataTypeOpen(false)
                                                }}
                                                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                                                    selectedDataType === option.value 
                                                        ? 'bg-blue-50 text-blue-600 font-medium' 
                                                        : 'text-gray-900'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Granularity Select */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Data Granularity
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsGranularityOpen(!isGranularityOpen)}
                                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-left flex items-center justify-between"
                                >
                                    <span className="text-gray-900">
                                        {granularityOptions.find(option => option.value === selectedGranularity)?.label}
                                    </span>
                                    <FaChevronDown
                                        className={`text-gray-400 transition-transform duration-200 ${
                                            isGranularityOpen ? 'transform rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {isGranularityOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                        {granularityOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                disabled={option.disabled}
                                                onClick={() => {
                                                    if (!option.disabled) {
                                                        setSelectedGranularity(option.value)
                                                        setIsGranularityOpen(false)
                                                    }
                                                }}
                                                className={`w-full px-4 py-3 text-left transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                                                    option.disabled 
                                                        ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                                                        : selectedGranularity === option.value 
                                                            ? 'bg-blue-50 text-blue-600 font-medium hover:bg-blue-50' 
                                                            : 'text-gray-900 hover:bg-blue-50'
                                                }`}
                                                title={option.disabled ? option.description : ''}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{option.label}</span>
                                                    {option.description && (
                                                        <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hospital Area Select */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Hospital Area
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsAreaOpen(!isAreaOpen)}
                                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-left flex items-center justify-between"
                                >
                                    <span className="text-gray-900">
                                        {areaOptions.find(option => option.value === selectedArea)?.label}
                                    </span>
                                    <FaChevronDown
                                        className={`text-gray-400 transition-transform duration-200 ${
                                            isAreaOpen ? 'transform rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {isAreaOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                        {areaOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                disabled={!option.enabled}
                                                onClick={() => {
                                                    if (option.enabled) {
                                                        setSelectedArea(option.value)
                                                        setIsAreaOpen(false)
                                                    }
                                                }}
                                                className={`w-full px-4 py-3 text-left transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                                                    !option.enabled 
                                                        ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                                                        : selectedArea === option.value 
                                                            ? 'bg-blue-50 text-blue-600 font-medium hover:bg-blue-50' 
                                                            : 'text-gray-900 hover:bg-blue-50'
                                                }`}
                                                title={!option.enabled ? 'Coming soon' : ''}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span>{option.label}</span>
                                                    {!option.enabled && (
                                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Soon</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Language Select */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Report Language
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-left flex items-center justify-between"
                                >
                                    <span className="text-gray-900 flex items-center gap-2">
                                        <span>{languageOptions.find(option => option.value === selectedLanguage)?.flag}</span>
                                        <span>{languageOptions.find(option => option.value === selectedLanguage)?.label}</span>
                                    </span>
                                    <FaChevronDown
                                        className={`text-gray-400 transition-transform duration-200 ${
                                            isLanguageOpen ? 'transform rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {isLanguageOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                        {languageOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedLanguage(option.value)
                                                    setIsLanguageOpen(false)
                                                }}
                                                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                                                    selectedLanguage === option.value 
                                                        ? 'bg-blue-50 text-blue-600 font-medium' 
                                                        : 'text-gray-900'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{option.flag}</span>
                                                    <span>{option.label}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Date Range Buttons */}
                    <div className="flex flex-wrap gap-2 mt-6">
                        <div className="w-full text-sm text-gray-600 mb-2">Seleções rápidas de período:</div>
                        <button
                            onClick={() => setQuickDateRange(0)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => setQuickDateRange(1)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                        >
                            Ontem
                        </button>
                        <button
                            onClick={() => setQuickDateRange(7)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                        >
                            Últimos 7 dias
                        </button>
                        <button
                            onClick={() => setQuickDateRange(30)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                        >
                            Últimos 30 dias
                        </button>
                    </div>

                    {/* Generate Report Button */}
                    <div className="flex justify-between items-center mt-8">
                        <div className="flex gap-2">
                            <button
                                onClick={handleTestConnectivity}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <FaFilter />
                                Testar API
                            </button>

                            <button
                                onClick={handleSuggestAlternatives}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 focus:ring-4 focus:ring-green-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <FaCalendarAlt />
                                Buscar Dados
                            </button>

                            <button
                                onClick={handleDebugInfo}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 font-medium rounded-lg hover:bg-yellow-200 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <FaClock />
                                Info Debug
                            </button>
                        </div>

                        <button
                            onClick={handleGenerateReport}
                            disabled={!startDate || !endDate || loading}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FaFileDownload />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Report Preview/Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Preview</h3>

                    {startDate && endDate && (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Period:</span>
                                <span className="font-medium text-gray-900">
                                    {formatDateBR(startDate)} - {formatDateBR(endDate)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Data Type:</span>
                                <span className="font-medium text-gray-900">
                                    {dataTypeOptions.find(option => option.value === selectedDataType)?.label}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Granularity:</span>
                                <span className="font-medium text-gray-900">
                                    {granularityOptions.find(option => option.value === selectedGranularity)?.label}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Hospital Area:</span>
                                <span className="font-medium text-gray-900">
                                    {areaOptions.find(option => option.value === selectedArea)?.label}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Language:</span>
                                <span className="font-medium text-gray-900 flex items-center gap-2">
                                    <span>{languageOptions.find(option => option.value === selectedLanguage)?.flag}</span>
                                    <span>{languageOptions.find(option => option.value === selectedLanguage)?.label}</span>
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium text-gray-900">
                                    {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days
                                </span>
                            </div>
                        </div>
                    )}

                    {(!startDate || !endDate) && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                                <FaCalendarAlt size={48} className="mx-auto" />
                            </div>
                            <p className="text-gray-500">Select dates to preview your report configuration</p>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    )
}
