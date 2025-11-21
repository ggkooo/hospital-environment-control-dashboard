import { useState, useEffect, useRef } from 'react'
import { TYPES, ICON_LABEL_MAP } from '../../../utils/sensorConstants'
import { FaCalendarAlt, FaChevronDown, FaFileDownload, FaFilter, FaSpinner } from 'react-icons/fa'
import { Sidebar } from "../../../components/Sidebar/index.jsx"
import { Header } from "../../../components/Header/index.jsx"
import { useReportData } from '../../../hooks/useReportData.jsx'
import { generatePDFReport } from '../../../utils/pdfGenerator.js'
import { logAction } from '../../../utils/logAction.js'

export function ReportsManager() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedDataType, setSelectedDataType] = useState('all')
    const [selectedGranularity, setSelectedGranularity] = useState('hourly')
    const [selectedArea, setSelectedArea] = useState('pharmacy')
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [isDataTypeOpen, setIsDataTypeOpen] = useState(false)
    const [isGranularityOpen, setIsGranularityOpen] = useState(false)
    const [isAreaOpen, setIsAreaOpen] = useState(false)
    const [isLanguageOpen, setIsLanguageOpen] = useState(false)
    const [availableDays, setAvailableDays] = useState([])
    const { fetchReportData, loading, fetchAvailableDays, suggestAlternativePeriods } = useReportData()
    const loggedRef = useRef(false)

    const handleSuggestAlternatives = async () => {
        const suggestions = await suggestAlternativePeriods()

        if (suggestions.length > 0) {
            const message = `Found data in these periods:\n\n${suggestions.map(s => 
                `${s.period}: ${s.startDate} to ${s.endDate}`
            ).join('\n')}\n\nWould you like to use the most recent period (${suggestions[0].period})?`

            if (confirm(message)) {
                setStartDate(suggestions[0].startDate)
                setEndDate(suggestions[0].endDate)
            }
        } else {
            alert('No recent data periods found. The sensors may not be active or there may be API connectivity issues.')
        }
    }

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

    const calculateDaysDifference = () => {
        if (!startDate || !endDate) return 0
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const daysDifference = calculateDaysDifference()
    const hasMinimumDaysForDaily = daysDifference >= 3

    const granularityOptions = [
        { value: 'hourly', label: 'Per Hour', description: 'Hourly aggregated data', disabled: false },
        { value: 'daily', label: 'Per Day', description: 'Daily aggregated data', disabled: !hasMinimumDaysForDaily },
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

            if (!startDate && !endDate) {
                const today = new Date()
                const yesterday = new Date()
                yesterday.setDate(today.getDate() - 1)

                setStartDate(yesterday.toISOString().split('T')[0])
                setEndDate(yesterday.toISOString().split('T')[0])
            }
        }

        initializeDates()
    }, [fetchAvailableDays])

    useEffect(() => {
        if (!startDate || !endDate) return

        const daysDiff = calculateDaysDifference()
        const sameDay = startDate === endDate

        if (sameDay && selectedGranularity !== 'hourly') {
            setSelectedGranularity('hourly')
        }
        else if (daysDiff < 3 && selectedGranularity === 'daily') {
            setSelectedGranularity('hourly')
        }
    }, [startDate, endDate])

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            alert('Por favor, selecione as datas de início e fim')
            return
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('A data de início deve ser anterior ou igual à data de fim')
            return
        }

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

        const daysDifference = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
        if (daysDifference > 90) {
            const confirm = window.confirm('Você selecionou um período de mais de 90 dias. Isso pode gerar um relatório muito grande e demorar para processar. Deseja continuar?')
            if (!confirm) return
        }

        if (startDate === endDate && selectedGranularity !== 'hourly') {
            alert('Para o mesmo dia, apenas a granularidade "Per Hour" está disponível.')
            setSelectedGranularity('hourly')
            return
        }

        if (daysDifference < 3 && selectedGranularity === 'daily') {
            alert('A granularidade "Per Day" requer pelo menos 3 dias de diferença entre as datas.')
            setSelectedGranularity('hourly')
            return
        }

        try {
            const reportData = await fetchReportData(startDate, endDate, selectedDataType, selectedGranularity)

            await generatePDFReport(reportData, startDate, endDate, selectedDataType, selectedGranularity, selectedArea, selectedLanguage)

        } catch (err) {
            console.error('Erro ao gerar relatório:', err)

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
• Tente novamente em alguns momentos`
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

    useEffect(() => {
        if (loggedRef.current) return
        loggedRef.current = true

        logAction('Page Access', 'Administration/Reports Manager');
    }, []);

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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:grid-cols-3">
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

                    {/* Generate Report Button */}
                    <div className="flex justify-end items-center mt-8">
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
                                    {Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))} days
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
