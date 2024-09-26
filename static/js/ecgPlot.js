import { layout, config } from './config.js';
import { updateXAxisRange } from './utils.js';
import { adjustGraphSize } from './graphResizeUtility.js';

let isDataFlowing = true;
let startTime = null;
let ecgData = { x: [], y: [] };
let plotInitialized = false;

export function initPlot() {
    if (!document.getElementById('ecg-plot')) {
        console.warn('El contenedor del gráfico no está listo. Reintentando...');
        setTimeout(initPlot, 100);
        return;
    }

    if (!window.Plotly) {
        console.error('Plotly no está cargado. Asegúrate de que el script de Plotly esté incluido antes de inicializar el gráfico.');
        return;
    }

    Plotly.newPlot('ecg-plot', [{
        x: ecgData.x,
        y: ecgData.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#00b300', width: 1.5 }
    }], layout, config).then(() => {
        plotInitialized = true;
        adjustGraphSize();
    }).catch(error => {
        console.error('Error al inicializar el gráfico:', error);
    });

    window.addEventListener('resize', debounce(() => {
        if (plotInitialized) {
            adjustGraphSize();
            updatePlotData();
        }
    }, 250));
}

export function updateECG() {
    if (!isDataFlowing || !plotInitialized) return;
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            if (startTime === null) {
                startTime = data.x[0];
            }

            let adjustedX = data.x.map(x => x - startTime);

            ecgData.x = adjustedX;
            ecgData.y = data.y;

            updatePlotData();
        })
        .catch(error => console.error('Error al actualizar ECG:', error));
}

export function updatePlotData() {
    if (ecgData.x.length > 0 && ecgData.y.length > 0 && plotInitialized) {
        Plotly.update('ecg-plot', {
            x: [ecgData.x],
            y: [ecgData.y]
        }, {}, [0]).catch(error => console.warn('Error al actualizar los datos del gráfico:', error));
        updateXAxisRange(ecgData.x[ecgData.x.length - 1]);
    }
}

export function toggleDataFlow() {
    isDataFlowing = !isDataFlowing;
    return isDataFlowing;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}