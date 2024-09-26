// Configuración del layout de Plotly
const layout = {
    title: 'Fisioaccess 2.1',
    margin: { t: 30, b: 30, l: 50, r: 20 },
    xaxis: {
        title: 'Tiempo (s)',
        fixedrange: true,
        range: [0, 5]
    },
    yaxis: {
        title: 'Amplitud (mV)',
        range: [-0.5, 1.5],
        fixedrange: true
    },
    shapes: [],
    annotations: []
};

// Configuración de Plotly
const config = {
    responsive: true,
    scrollZoom: false,
    displayModeBar: true,
    displaylogo: false,
    editable: true,
    modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d']
};

// Colores para las mediciones
const measurementColors = ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF'];

export { layout, config, measurementColors };