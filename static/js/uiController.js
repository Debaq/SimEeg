import { getElements, removeElementById } from './elementManager.js';
import { initPlot } from './ecgPlot.js';
import { setupEventListeners } from './eventHandlers.js';

export function updateElementsList() {
    const container = document.getElementById('ecg-container');
    const elements = getElements();
    let listContent = `
        <h2>Lista de Elementos</h2>
        <ul id="elements-list">
            ${elements.map(el => `
                <li>
                    ${el.type}: ${el.details.text}
                    <button onclick="removeElementAndUpdate(${el.id})">Eliminar</button>
                </li>
            `).join('')}
        </ul>
        <button id="back-to-ecg">Volver al ECG</button>
    `;
    container.innerHTML = listContent;

    document.getElementById('back-to-ecg').addEventListener('click', showECGContent);
}

export function showECGContent() {
    const container = document.getElementById('ecg-container');
    container.innerHTML = `
        <div id="ecg-plot"></div>
        <div id="controls">
            <button id="toggle-data">Detener Datos</button>
            <div class="dropdown">
                <button id="dropdown-btn">Opciones</button>
                <div id="dropdown-content">
                    <button id="measure">Medir Distancia</button>
                    <div id="mark-buttons">
                        <button class="mark-button" data-mark="P">P</button>
                        <button class="mark-button" data-mark="Q">Q</button>
                        <button class="mark-button" data-mark="R">R</button>
                        <button class="mark-button" data-mark="S">S</button>
                        <button class="mark-button" data-mark="T">T</button>
                        <button class="mark-button" data-mark="U">U</button>
                    </div>
                    <select id="interval-type">
                        <option value="">Seleccionar Intervalo/Segmento</option>
                        <option value="Intervalo PR">Intervalo PR</option>
                        <option value="Segmento PR">Segmento PR</option>
                        <option value="Intervalo QT">Intervalo QT</option>
                        <option value="Segmento ST">Segmento ST</option>
                        <option value="Complejo QRS">Complejo QRS</option>
                        <option value="Intervalo R-R">Intervalo R-R</option>
                    </select>
                    <button id="export-image">Exportar Imagen</button>
                    <button id="delete-last-annotation">Eliminar Última Anotación</button>
                    <button id="delete-all-annotations">Eliminar Todas las Anotaciones</button>
                    <button id="manage-elements">Gestionar Elementos</button>
                </div>
            </div>
        </div>
    `;
    initPlot();
    setupEventListeners();
    setupDropdown();
}

function setupDropdown() {
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownContent = document.getElementById('dropdown-content');

    dropdownBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdownContent.classList.toggle('show');
    });

    // Cerrar el menú desplegable si se hace clic fuera de él
    window.addEventListener('click', function(event) {
        if (!event.target.matches('#dropdown-btn') && !event.target.closest('#dropdown-content')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });
}

// Función global para eliminar un elemento y actualizar la lista
window.removeElementAndUpdate = function(id) {
    removeElementById(id);
    updateElementsList();
};

// Asegúrate de que setupDropdown se llame cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    showECGContent();
});