import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { UNIT_MAP, ICON_LABEL_MAP } from './sensorConstants'
import { getTranslation, formatDate, formatNumber } from './translations'
import logoSrc from '../assets/logo.png'

// Registrar todos os componentes do Chart.js
Chart.register(...registerables)

// Função para criar ícone real do GitHub usando SVG
function createGitHubIcon() {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')

    // Background transparente
    ctx.clearRect(0, 0, 32, 32)

    // SVG do GitHub (oficial)
    const githubSvg = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="#24292e"/>
        </svg>
    `

    // Converter SVG para imagem
    const img = new Image()
    const svgBlob = new Blob([githubSvg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    return new Promise((resolve) => {
        img.onload = function() {
            ctx.drawImage(img, 0, 0, 32, 32)
            URL.revokeObjectURL(url)
            resolve(canvas.toDataURL('image/png'))
        }
        img.src = url
    })
}

// Função para criar ícone real do WhatsApp usando SVG
function createWhatsAppIcon() {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')

    // Background transparente
    ctx.clearRect(0, 0, 32, 32)

    // SVG do WhatsApp (oficial)
    const whatsappSvg = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" fill="#25D366"/>
        </svg>
    `

    // Converter SVG para imagem
    const img = new Image()
    const svgBlob = new Blob([whatsappSvg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    return new Promise((resolve) => {
        img.onload = function() {
            ctx.drawImage(img, 0, 0, 32, 32)
            URL.revokeObjectURL(url)
            resolve(canvas.toDataURL('image/png'))
        }
        img.src = url
    })
}

// Função para carregar logo e obter suas dimensões
async function loadLogoWithDimensions() {
    try {
        const response = await fetch(logoSrc)
        if (!response.ok) {
            throw new Error(`Failed to fetch logo: ${response.status}`)
        }

        const blob = await response.blob()

        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result
                if (result && result.startsWith('data:image')) {
                    // Criar uma imagem para obter dimensões
                    const img = new Image()
                    img.onload = () => {
                        resolve({
                            data: result,
                            width: img.width,
                            height: img.height,
                            aspectRatio: img.width / img.height
                        })
                    }
                    img.onerror = () => {
                        console.warn('Failed to load image dimensions')
                        resolve(null)
                    }
                    img.src = result
                } else {
                    console.warn('Logo is not a valid image format')
                    resolve(null)
                }
            }
            reader.onerror = () => {
                console.warn('Failed to read logo file')
                resolve(null)
            }
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.warn('Failed to load logo:', error)
        return null
    }
}

// Função para adicionar cabeçalho personalizado com logos e links sociais
async function addCustomHeader(doc, logoInfo = null) {
    const pageWidth = doc.internal.pageSize.getWidth()
    const headerHeight = 25

    // Background do cabeçalho limpo
    doc.setFillColor(255, 255, 255) // branco
    doc.rect(0, 0, pageWidth, headerHeight, 'F')

    // Linha inferior do cabeçalho
    doc.setDrawColor(229, 231, 235) // gray-200
    doc.setLineWidth(0.5)
    doc.line(0, headerHeight - 1, pageWidth, headerHeight - 1)

    // Logo principal (esquerda)
    if (logoInfo && logoInfo.data) {
        try {
            // Calcular dimensões mantendo proporção original
            const maxLogoHeight = 15 // altura máxima no cabeçalho
            const maxLogoWidth = 60   // largura máxima no cabeçalho

            let logoWidth = logoInfo.width
            let logoHeight = logoInfo.height

            // Escalar mantendo proporção se necessário
            if (logoHeight > maxLogoHeight) {
                logoWidth = (logoWidth * maxLogoHeight) / logoHeight
                logoHeight = maxLogoHeight
            }

            if (logoWidth > maxLogoWidth) {
                logoHeight = (logoHeight * maxLogoWidth) / logoWidth
                logoWidth = maxLogoWidth
            }

            // Converter para unidades do PDF (assumindo 72 DPI)
            const pdfLogoWidth = logoWidth * 0.75
            const pdfLogoHeight = logoHeight * 0.75

            // Posicionar à esquerda
            const logoX = 15
            const logoY = (headerHeight - pdfLogoHeight) / 2 + 2

            console.log(`Main logo PDF dimensions: ${pdfLogoWidth}x${pdfLogoHeight} at position (${logoX}, ${logoY})`)

            doc.addImage(logoInfo.data, 'PNG', logoX, logoY, pdfLogoWidth, pdfLogoHeight, undefined, 'FAST')
        } catch (error) {
            console.warn('Failed to add main logo to PDF:', error)
        }
    }

    // Logos sociais (direita)
    try {
        const socialIconSize = 4 // tamanho reduzido dos ícones sociais
        const socialSpacing = 8 // espaçamento reduzido entre ícones (mais próximos)
        const rightMargin = 15

        // Posição vertical centralizada
        const socialY = (headerHeight - socialIconSize) / 2 + 2

        // Logo do GitHub (mais à direita)
        const githubX = pageWidth - rightMargin - socialIconSize

        // Criar ícone real do GitHub usando SVG
        const githubIcon = await createGitHubIcon()
        doc.link(githubX, socialY, socialIconSize, socialIconSize, { url: 'https://github.com/ggkooo' })
        doc.addImage(githubIcon, 'PNG', githubX, socialY, socialIconSize, socialIconSize)

        // Logo do WhatsApp (à esquerda do GitHub)
        const whatsappX = githubX - socialSpacing - socialIconSize

        // Criar ícone real do WhatsApp usando SVG
        const whatsappIcon = await createWhatsAppIcon()
        doc.link(whatsappX, socialY, socialIconSize, socialIconSize, { url: 'https://wa.me/5511970556189' })
        doc.addImage(whatsappIcon, 'PNG', whatsappX, socialY, socialIconSize, socialIconSize)

    } catch (error) {
        console.warn('Failed to add social icons to PDF:', error)
    }

    return headerHeight + 5 // Return the Y position where content should start
}

// Função para adicionar rodapé personalizado
function addCustomFooter(doc, pageNumber, totalPages) {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const footerHeight = 20
    const footerY = pageHeight - footerHeight

    // Linha superior do rodapé
    doc.setDrawColor(59, 130, 246) // blue-600
    doc.setLineWidth(0.5)
    doc.line(0, footerY, pageWidth, footerY)

    // Background do rodapé
    doc.setFillColor(249, 250, 251) // gray-50
    doc.rect(0, footerY, pageWidth, footerHeight, 'F')

    // Copyright (esquerda) - nome clicável para GitHub
    doc.setFontSize(8)
    doc.setTextColor(59, 130, 246) // blue-600 - nome clicável
    doc.setFont('helvetica', 'normal')

    // Nome clicável para GitHub
    doc.textWithLink('Giordano Berwig', 12, footerY + 8, {
        url: 'https://github.com/ggkooo'
    })

    // Resto do copyright
    const nameWidth = doc.getTextWidth('Giordano Berwig')
    doc.setTextColor(75, 85, 99) // gray-600
    doc.text(' - Hospital Environment Control Dashboard © 2025', 12 + nameWidth, footerY + 8)

    // Número da página (direita)
    doc.setTextColor(75, 85, 99) // gray-600
    doc.setFontSize(8)
    const pageText = `Página ${pageNumber} de ${totalPages}`
    const pageTextWidth = doc.getTextWidth(pageText)
    doc.text(pageText, pageWidth - pageTextWidth - 12, footerY + 8)

    // Versão do sistema (canto inferior direito)
    doc.setFontSize(6)
    doc.setTextColor(156, 163, 175) // gray-400
    doc.text('v1.0', pageWidth - 15, footerY + 14)
}

// Mapear granularidade para chaves de tradução
const granularityKeys = {
    minute: 'perMinute',
    hourly: 'perHour',
    daily: 'perDay',
    hour: 'perHour',
    day: 'perDay',
    week: 'perWeek',
    month: 'perMonth'
}

// Mapear tipos de dados para chaves de tradução
const dataTypeKeys = {
    all: 'allDataTypes',
    temperature: 'temperature',
    humidity: 'humidity',
    pressure: 'pressure',
    eco2: 'eco2',
    tvoc: 'tvoc',
    noise: 'noise'
}

// Mapear áreas para chaves de tradução
const areaKeys = {
    pharmacy: 'pharmacy',
    icu: 'icu',
    reception: 'reception',
    emergency: 'emergencyRoom',
    surgery: 'surgery',
    laboratory: 'laboratory'
}

// Função para obter nome do idioma
function getLanguageName(languageCode) {
    const languageNames = {
        'en': 'English',
        'de': 'Deutsch (German)',
        'tr': 'Türkçe (Turkish)',
        'pt-br': 'Português (Portuguese)',
        'es': 'Español (Spanish)'
    }

    return languageNames[languageCode] || languageCode.toUpperCase()
}

// Função para calcular estatísticas avançadas
function calculateAdvancedStats(values) {
    // Filtrar valores válidos (não nulos e não NaN)
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v))

    if (validValues.length === 0) {
        return {
            min: 0, max: 0, mean: 0, median: 0,
            q1: 0, q3: 0, stdDev: 0, coeffVar: 0,
            count: 0, dataPoints: values.length,
            completeness: 0
        }
    }

    const sortedValues = [...validValues].sort((a, b) => a - b)
    const n = validValues.length

    const min = Math.min(...validValues)
    const max = Math.max(...validValues)
    const mean = validValues.reduce((sum, val) => sum + val, 0) / n

    // Mediana
    const median = n % 2 === 0
        ? (sortedValues[n/2 - 1] + sortedValues[n/2]) / 2
        : sortedValues[Math.floor(n/2)]

    // Quartis
    const q1 = n % 4 === 0
        ? (sortedValues[n/4 - 1] + sortedValues[n/4]) / 2
        : sortedValues[Math.floor(n/4)]
    const q3 = n % 4 === 0
        ? (sortedValues[3*n/4 - 1] + sortedValues[3*n/4]) / 2
        : sortedValues[Math.floor(3*n/4)]

    // Desvio padrão
    const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1 || 1)
    const stdDev = Math.sqrt(variance)

    // Coeficiente de variação
    const coeffVar = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0

    // Completeness dos dados
    const completeness = values.length > 0 ? (validValues.length / values.length) * 100 : 0

    return {
        min, max, mean, median, q1, q3, stdDev, coeffVar,
        count: n, dataPoints: values.length, completeness
    }
}

// Função para criar gráfico de linha temporal
async function createTimeSeriesChart(data, sensorType, unit, granularity = 'minute', selectedLanguage = 'en') {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 400

    const ctx = canvas.getContext('2d')

    // Separar dados com valores e sem valores
    const chartData = data.map(item => ({
        x: new Date(item.timestamp),
        y: item.value !== null && !isNaN(item.value) ? item.value : null
    }))

    // Configurar formato de tempo baseado na granularidade
    const timeFormats = {
        minute: {
            unit: 'minute',
            displayFormats: {
                minute: 'HH:mm',
                hour: 'dd/MM HH:mm',
                day: 'dd/MM'
            }
        },
        hour: {
            unit: 'hour',
            displayFormats: {
                hour: 'HH:mm',
                day: 'dd/MM',
                week: 'dd/MM'
            }
        },
        day: {
            unit: 'day',
            displayFormats: {
                day: 'dd/MM',
                week: 'dd/MM',
                month: 'MM/yy'
            }
        },
        week: {
            unit: 'week',
            displayFormats: {
                week: 'dd/MM',
                month: 'MM/yy'
            }
        },
        month: {
            unit: 'month',
            displayFormats: {
                month: 'MM/yy'
            }
        }
    }

    const timeConfig = timeFormats[granularity] || timeFormats.minute

    // Obter label traduzido do sensor
    const sensorLabel = getTranslation(selectedLanguage, dataTypeKeys[sensorType] || sensorType) || ICON_LABEL_MAP[sensorType] || sensorType

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: `${sensorLabel} (${unit})`,
                data: chartData,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1,
                spanGaps: false // Não conectar pontos com dados ausentes
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: `${getTranslation(selectedLanguage, 'chartTitle')} (${getTranslation(selectedLanguage, granularityKeys[granularity] || 'perMinute')})`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: timeConfig.unit,
                        displayFormats: timeConfig.displayFormats
                    },
                    title: {
                        display: true,
                        text: getTranslation(selectedLanguage, 'timeAxis')
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: `${sensorLabel} (${unit})`
                    }
                }
            },
            elements: {
                point: {
                    radius: granularity === 'hour' || granularity === 'day' ? 3 : 1
                }
            }
        }
    })

    // Aguardar a renderização
    await new Promise(resolve => setTimeout(resolve, 100))

    const imageData = canvas.toDataURL('image/png')
    chart.destroy()

    return imageData
}

// Função para criar histograma
async function createHistogram(values, sensorType, unit, selectedLanguage = 'en') {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 300

    const ctx = canvas.getContext('2d')

    // Filtrar apenas valores válidos (não nulos e não NaN)
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v))

    if (validValues.length === 0) {
        // Criar gráfico vazio se não há dados válidos
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Frequency',
                    data: [0],
                    backgroundColor: 'rgba(156, 163, 175, 0.6)',
                    borderColor: '#9CA3AF',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Distribution - No Valid Data`,
                        font: { size: 14, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })

        await new Promise(resolve => setTimeout(resolve, 100))
        const imageData = canvas.toDataURL('image/png')
        chart.destroy()
        return imageData
    }

    // Calcular histogram bins
    const min = Math.min(...validValues)
    const max = Math.max(...validValues)
    const bins = 12 // Número de bins

    if (min === max) {
        // Todos os valores são iguais
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [`${formatNumber(min, selectedLanguage)} ${unit}`],
                datasets: [{
                    label: 'Frequency',
                    data: [validValues.length],
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3B82F6',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Distribution (All values equal)`,
                        font: { size: 14, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })

        await new Promise(resolve => setTimeout(resolve, 100))
        const imageData = canvas.toDataURL('image/png')
        chart.destroy()
        return imageData
    }

    const binSize = (max - min) / bins
    const binCounts = new Array(bins).fill(0)
    const binLabels = []

    for (let i = 0; i < bins; i++) {
        const binStart = min + i * binSize
        const binEnd = min + (i + 1) * binSize
        binLabels.push(`${formatNumber(binStart, selectedLanguage)} - ${formatNumber(binEnd, selectedLanguage)}`)
    }

    validValues.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1)
        binCounts[binIndex]++
    })

    const sensorLabel = getTranslation(selectedLanguage, dataTypeKeys[sensorType] || sensorType) || ICON_LABEL_MAP[sensorType] || sensorType

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Frequency',
                data: binCounts,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3B82F6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: `${sensorLabel} Distribution`,
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: `${sensorLabel} (${unit})`
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                }
            }
        }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    const imageData = canvas.toDataURL('image/png')
    chart.destroy()

    return imageData
}

export async function generatePDFReport(data, startDate, endDate, dataType, granularity = 'minute', selectedArea = 'pharmacy', selectedLanguage = 'en') {
    const doc = new jsPDF()

    // Carregar logo com dimensões
    console.log('Loading logo with dimensions for PDF header...')
    const logoInfo = await loadLogoWithDimensions()

    // Configurações do PDF
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const headerHeight = 30
    const footerHeight = 20
    const contentStartY = headerHeight
    const contentEndY = pageHeight - footerHeight
    const availableHeight = contentEndY - contentStartY

    // Função para adicionar cabeçalho e rodapé em uma página
    async function setupPageHeaderFooter(pageNum, totalPages) {
        await addCustomHeader(doc, logoInfo)
        addCustomFooter(doc, pageNum, totalPages)
    }

    // Versão síncrona para callbacks (sem ícones sociais)
    function setupPageHeaderFooterSync(pageNum, totalPages) {
        const pageWidth = doc.internal.pageSize.getWidth()
        const headerHeight = 25

        // Background do cabeçalho limpo
        doc.setFillColor(255, 255, 255) // branco
        doc.rect(0, 0, pageWidth, headerHeight, 'F')

        // Linha inferior do cabeçalho
        doc.setDrawColor(229, 231, 235) // gray-200
        doc.setLineWidth(0.5)
        doc.line(0, headerHeight - 1, pageWidth, headerHeight - 1)

        // Logo principal (esquerda) - apenas se disponível
        if (logoInfo && logoInfo.data) {
            try {
                const maxLogoHeight = 15
                const maxLogoWidth = 60

                let logoWidth = logoInfo.width
                let logoHeight = logoInfo.height

                if (logoHeight > maxLogoHeight) {
                    logoWidth = (logoWidth * maxLogoHeight) / logoHeight
                    logoHeight = maxLogoHeight
                }

                if (logoWidth > maxLogoWidth) {
                    logoHeight = (logoHeight * maxLogoWidth) / logoWidth
                    logoWidth = maxLogoWidth
                }

                const pdfLogoWidth = logoWidth * 0.75
                const pdfLogoHeight = logoHeight * 0.75

                const logoX = 15
                const logoY = (headerHeight - pdfLogoHeight) / 2 + 2

                doc.addImage(logoInfo.data, 'PNG', logoX, logoY, pdfLogoWidth, pdfLogoHeight, undefined, 'FAST')
            } catch (error) {
                console.warn('Failed to add main logo to PDF:', error)
            }
        }

        addCustomFooter(doc, pageNum, totalPages)
    }

    // Configurar primeira página
    let yPosition = await addCustomHeader(doc, logoInfo)
    yPosition += 10 // Espaçamento adicional após o cabeçalho

    // Função auxiliar para verificar se precisa de nova página
    function checkNewPage(requiredSpace) {
        if (yPosition + requiredSpace > contentEndY) {
            doc.addPage()
            yPosition = contentStartY + 20 // Mais espaço no topo de novas páginas
            return true
        }
        return false
    }

    // Função para formatar data baseada no idioma selecionado
    const formatReportDate = (dateString) => {
        return formatDate(dateString, selectedLanguage)
    }

    // Título principal do relatório (agora que o cabeçalho só tem logo)
    doc.setFontSize(24)
    doc.setTextColor(31, 41, 55) // gray-800
    doc.setFont('helvetica', 'bold')
    doc.text(getTranslation(selectedLanguage, 'reportTitle'), margin, yPosition)
    yPosition += 15

    doc.setFontSize(12)
    doc.setTextColor(107, 114, 128) // gray-500
    doc.setFont('helvetica', 'normal')
    const currentDate = new Date()
    const reportGeneratedText = `${getTranslation(selectedLanguage, 'reportDate')}: ${formatDate(currentDate.toISOString().split('T')[0], selectedLanguage)} ${currentDate.toLocaleTimeString()}`
    doc.text(reportGeneratedText, margin, yPosition)
    yPosition += 25

    // ...existing code...

    // Informações do relatório
    doc.setFontSize(16)
    doc.setTextColor(31, 41, 55) // gray-800
    doc.setFont('helvetica', 'bold')
    doc.text(getTranslation(selectedLanguage, 'configuration'), margin, yPosition)
    yPosition += 15

    doc.setFontSize(11)
    doc.setTextColor(75, 85, 99) // gray-600
    doc.setFont('helvetica', 'normal')

    const aggregationNote = granularity !== 'minute' ? ' (Frontend Aggregated)' : ''
    const dataTypeLabel = dataType === 'all' ? getTranslation(selectedLanguage, 'allDataTypes') : getTranslation(selectedLanguage, dataTypeKeys[dataType]) || ICON_LABEL_MAP[dataType]
    const granularityLabel = getTranslation(selectedLanguage, granularityKeys[granularity]) || granularityKeys.minute
    const areaLabel = getTranslation(selectedLanguage, areaKeys[selectedArea]) || selectedArea

    // Calcular duração de forma que evite problemas de fuso horário
    let startDateObj, endDateObj;
    if (typeof startDate === 'string' && startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = startDate.split('-').map(Number);
        startDateObj = new Date(year, month - 1, day);
    } else {
        startDateObj = new Date(startDate);
    }

    if (typeof endDate === 'string' && endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = endDate.split('-').map(Number);
        endDateObj = new Date(year, month - 1, day);
    } else {
        endDateObj = new Date(endDate);
    }

    const durationDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24))

    const reportInfo = [
        [`${getTranslation(selectedLanguage, 'reportPeriod')}:`, `${formatReportDate(startDate)} - ${formatReportDate(endDate)}`],
        [`${getTranslation(selectedLanguage, 'dataType')}:`, dataTypeLabel],
        [`${getTranslation(selectedLanguage, 'granularity')}:`, `${granularityLabel}${aggregationNote}`],
        [`${getTranslation(selectedLanguage, 'hospitalArea')}:`, areaLabel],
        [`${getTranslation(selectedLanguage, 'language')}:`, getLanguageName(selectedLanguage)],
        [`${getTranslation(selectedLanguage, 'duration')}:`, `${durationDays} ${getTranslation(selectedLanguage, 'days')}`],
        ['Total Data Points:', Object.values(data).reduce((sum, sensorData) => sum + sensorData.length, 0)]
    ]

    // Verificar se há espaço para a tabela
    checkNewPage(80)

    autoTable(doc, {
        head: [],
        body: reportInfo,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 10,
            cellPadding: 3,
        },
        columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
        },
        didDrawPage: function (data) {
            // Este callback é chamado para cada página da tabela
            const pageNum = doc.getCurrentPageInfo().pageNumber
            setupPageHeaderFooterSync(pageNum, doc.getNumberOfPages())
        }
    })

    yPosition = doc.lastAutoTable.finalY + 25

    // Processar cada tipo de sensor
    const sensorTypes = dataType === 'all' ? Object.keys(data) : [dataType]

    for (const sensorType of sensorTypes) {
        const sensorData = data[sensorType]
        if (!sensorData || sensorData.length === 0) continue

        // Verificar se precisa de nova página para o sensor
        checkNewPage(100)

        // Título do sensor
        const sensorLabel = getTranslation(selectedLanguage, dataTypeKeys[sensorType] || sensorType) || ICON_LABEL_MAP[sensorType] || sensorType
        doc.setFontSize(18)
        doc.setTextColor(31, 41, 55) // gray-800
        doc.setFont('helvetica', 'bold')
        doc.text(`${sensorLabel} ${getTranslation(selectedLanguage, 'statistics')}`, margin, yPosition)
        yPosition += 15

        const unit = UNIT_MAP[sensorType] || ''
        const values = sensorData.map(item => item.value)
        const stats = calculateAdvancedStats(values)

        // Estatísticas avançadas com tradução
        const statsData = [
            ['Count (Valid)', stats.count.toString()],
            ['Total Data Points', stats.dataPoints.toString()],
            ['Data Completeness', `${formatNumber(stats.completeness, selectedLanguage)}%`],
            [getTranslation(selectedLanguage, 'average'), stats.count > 0 ? `${formatNumber(stats.mean, selectedLanguage)} ${unit}` : 'N/A'],
            ['Median', stats.count > 0 ? `${formatNumber(stats.median, selectedLanguage)} ${unit}` : 'N/A'],
            [getTranslation(selectedLanguage, 'standardDeviation'), stats.count > 0 ? `${formatNumber(stats.stdDev, selectedLanguage)} ${unit}` : 'N/A'],
            [getTranslation(selectedLanguage, 'minimum'), stats.count > 0 ? `${formatNumber(stats.min, selectedLanguage)} ${unit}` : 'N/A'],
            ['Q1 (25%)', stats.count > 0 ? `${formatNumber(stats.q1, selectedLanguage)} ${unit}` : 'N/A'],
            ['Q3 (75%)', stats.count > 0 ? `${formatNumber(stats.q3, selectedLanguage)} ${unit}` : 'N/A'],
            [getTranslation(selectedLanguage, 'maximum'), stats.count > 0 ? `${formatNumber(stats.max, selectedLanguage)} ${unit}` : 'N/A'],
            ['Coeff. of Variation', stats.count > 0 ? `${formatNumber(stats.coeffVar, selectedLanguage)}%` : 'N/A'],
            ['Range', stats.count > 0 ? `${formatNumber(stats.max - stats.min, selectedLanguage)} ${unit}` : 'N/A']
        ]

        autoTable(doc, {
            head: [[getTranslation(selectedLanguage, 'statistics'), 'Value']],
            body: statsData,
            startY: yPosition,
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 9,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 'auto' }
            }
        })

        yPosition = doc.lastAutoTable.finalY + 20

        // Nova página para gráficos
        doc.addPage()
        yPosition = contentStartY + 10

        // Gráfico de série temporal
        try {
            const timeSeriesChart = await createTimeSeriesChart(sensorData, sensorType, unit, granularity, selectedLanguage)
            doc.addImage(timeSeriesChart, 'PNG', margin, yPosition, pageWidth - 2 * margin, 80)
            yPosition += 90

            // Gráfico de distribuição (histograma)
            const histogram = await createHistogram(values, sensorType, unit, selectedLanguage)
            doc.addImage(histogram, 'PNG', margin + 20, yPosition, (pageWidth - 2 * margin - 20), 60)
            yPosition += 70

        } catch (error) {
            console.warn('Error creating charts:', error)
            doc.setFontSize(12)
            doc.setTextColor(220, 38, 38) // red-600
            doc.setFont('helvetica', 'normal')
            doc.text('Error generating charts for this data type', margin, yPosition)
            yPosition += 20
        }

        yPosition += 15
    }

    // Aplicar cabeçalho e rodapé a todas as páginas
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        await setupPageHeaderFooter(i, totalPages)
    }

    // Salvar o PDF
    const fileName = `hospital_report_${selectedArea}_${startDate}_${endDate}_${selectedLanguage}.pdf`
    doc.save(fileName)

    console.log(`PDF report generated successfully with custom header/footer: ${fileName}`)
}
