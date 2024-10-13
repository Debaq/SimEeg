// ecgPlot.js

import { layout, config } from './config.js';
import { updateXAxisRange } from './utils.js';
import { adjustGraphSize } from './graphResizeUtility.js';

let isDataFlowing = true;
let startTime = null;
let ecgData = { x: [], y: [] };
let plotInitialized = false;
let socket;

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
        initSocketConnection();
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

function initSocketConnection() {
    socket = io();
    socket.on('connect', () => {
        console.log('Conectado al servidor Socket.IO');
    });

    socket.on('new_eeg_data', (data) => {
        if (isDataFlowing) {
            if (startTime === null) {
                startTime = data.x[0];
            }
            ecgData = {
                x: data.x.map(x => x - startTime),
                y: data.y
            };
            updatePlotData();
        }
    });

    socket.on('disconnect', () => {
        console.log('Desconectado del servidor Socket.IO');
    });
}

function updatePlotData() {
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

// Función para obtener los datos iniciales si es necesario
function getInitialData() {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            if (data.x.length > 0 && data.y.length > 0) {
                startTime = data.x[0];
                ecgData = {
                    x: data.x.map(x => x - startTime),
                    y: data.y
                };
                updatePlotData();
            }
        })
        .catch(error => console.error('Error al obtener los datos iniciales:', error));
}

// Llama a getInitialData al inicializar el plot si es necesario
// initPlot() {
//     ...
//     .then(() => {
//         plotInitialized = true;
//         adjustGraphSize();
//         initSocketConnection();
//         getInitialData();  // Añade esta línea si necesitas cargar datos iniciales
//     })
//     ...
// }