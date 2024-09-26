import { toggleDataFlow } from './ecgPlot.js';
import { removeLastElement, clearAllElements } from './elementManager.js';
import { updateElementsList, showECGContent } from './uiController.js';

export function handleToggleData(event) {
    event.preventDefault();
    const isFlowing = toggleDataFlow();
    this.textContent = isFlowing ? 'Detener Datos' : 'Reanudar Datos';
    console.log('Toggle data button pressed, new state:', isFlowing);
}

export function exportImage() {
    Plotly.toImage('ecg-plot', { format: 'png', width: 800, height: 600 }).then(function(dataUrl) {
        const link = document.createElement('a');
        link.download = 'ecg_plot.png';
        link.href = dataUrl;
        link.click();
    });
}

export function deleteLastAnnotation() {
    if (removeLastElement()) {
        updateElementsList();
    } else {
        alert('No hay anotaciones para eliminar.');
    }
}

export function deleteAllAnnotations() {
    clearAllElements();
    updateElementsList();
}


export function setupDropdown() {
    console.log('Setting up dropdown');
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownContent = document.getElementById('dropdown-content');

    if (!dropdownBtn || !dropdownContent) {
        console.error('Dropdown elements not found');
        return;
    }

    console.log('Dropdown elements found');

    function toggleDropdown(event) {
        console.log('Toggling dropdown');
        event.stopPropagation();
        dropdownContent.classList.toggle('show');
        console.log('Dropdown classes after toggle:', dropdownContent.classList.toString());
        console.log('Dropdown style display:', window.getComputedStyle(dropdownContent).display);
    }

    dropdownBtn.addEventListener('click', toggleDropdown);

    document.addEventListener('click', function(event) {
        if (!event.target.matches('#dropdown-btn') && !event.target.closest('#dropdown-content')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
                console.log('Dropdown closed');
            }
        }
    });

    console.log('Dropdown setup complete');
}