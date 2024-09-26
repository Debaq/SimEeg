import { handleToggleData, exportImage, deleteLastAnnotation, deleteAllAnnotations, setupDropdown } from './controlButtonHandlers.js';
import { setupMarkButtons, setupIntervalSelector } from './annotationHandlers.js';
import { handlePlotlyRelayout, startMeasuring } from './plotInteractionHandlers.js';
import { updateElementsList } from './uiController.js';

export function setupEventListeners() {
    console.log('Setting up event listeners');

    const toggleDataButton = document.getElementById('toggle-data');
    if (toggleDataButton) {
        ['click', 'touchstart'].forEach(eventType => {
            toggleDataButton.addEventListener(eventType, handleToggleData, { passive: false });
        });
    }

    document.getElementById('measure')?.addEventListener('click', startMeasuring);
    document.getElementById('export-image')?.addEventListener('click', exportImage);
    document.getElementById('delete-last-annotation')?.addEventListener('click', deleteLastAnnotation);
    document.getElementById('delete-all-annotations')?.addEventListener('click', deleteAllAnnotations);
    document.getElementById('manage-elements')?.addEventListener('click', updateElementsList);
    
    setupMarkButtons();
    setupIntervalSelector();
    
    console.log('About to call setupDropdown');
    setupDropdown();
    console.log('setupDropdown called');
    
    const ecgPlot = document.getElementById('ecg-plot');
    if (ecgPlot && ecgPlot.on) {
        ecgPlot.on('plotly_relayout', handlePlotlyRelayout);
    } else {
        console.error('ECG plot element not found or does not have "on" method');
    }

    console.log('All event listeners set up');
}