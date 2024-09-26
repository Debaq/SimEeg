import { initPlot, updateECG } from './ecgPlot.js';
import { setupEventListeners } from './eventHandlers.js';
import { showECGContent } from './uiController.js';
import { initJoystick } from './joystick.js';  
import { initOrientationDetection } from './orientation.js';

function init() {
    console.log('Initialization started');
    showECGContent();
    console.log('ECG content shown');
    initPlot();
    console.log('Plot initialized');
    
    // Esperar un poco antes de configurar los event listeners
    setTimeout(() => {
        console.log('Setting up event listeners');
        setupEventListeners();
        console.log('Event listeners set up');
    }, 100);
    
    // Iniciar la actualización periódica del ECG
    setInterval(updateECG, 10);
    
    // Inicializar componentes adicionales
    initJoystick();  
    initOrientationDetection();

    // Manejar el redimensionamiento de la ventana
    window.addEventListener('resize', function () {
        if (window.Plotly) {
            Plotly.Plots.resize('ecg-plot');
        }
    });

    console.log('Initialization completed');
}

// Asegurarse de que el DOM esté completamente cargado antes de inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exponer funciones globales si es necesario
window.toggleDataFlow = function() {
    // Implementar la lógica para alternar el flujo de datos si es necesario
};

// Otras funciones globales o configuraciones que puedan ser necesarias