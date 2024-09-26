import { layout } from './config.js';

// Función para añadir un elemento
function addElement(elements, elementCounter, markCounts, type, details) {
    elementCounter++;
    if (type === 'mark') {
        if (!markCounts[details.text]) {
            markCounts[details.text] = 0;
        }
        markCounts[details.text]++;
        details.text = `${details.text}${markCounts[details.text]}`;
    }
    elements.push({
        id: elementCounter,
        type: type,
        details: details
    });
    return elementCounter;
}

// Función para eliminar un elemento
function removeElement(elements, markCounts, id) {
    const index = elements.findIndex(el => el.id === id);
    if (index !== -1) {
        const element = elements[index];
        if (element.type === 'mark') {
            const markType = element.details.text.replace(/\d+$/, '');
            markCounts[markType]--;
        }
        elements.splice(index, 1);
    }
    return elements;
}

// Función para redibujar el gráfico
function redrawPlot(elements) {
    const shapes = [];
    const annotations = [];

    elements.forEach(el => {
        if (el.type === 'measurement' || el.type === 'interval') {
            shapes.push(el.details.shape);
            annotations.push(el.details.annotation);
        } else if (el.type === 'mark') {
            annotations.push(el.details.annotation);
        }
    });

    Plotly.relayout('ecg-plot', {
        shapes: shapes,
        annotations: annotations
    });
}

// Función para actualizar el rango del eje X
function updateXAxisRange(currentTime) {
    if (currentTime > 5) {
        Plotly.relayout('ecg-plot', {
            'xaxis.range': [currentTime - 5, currentTime]
        });
    }
}

// Función para convertir coordenadas del cursor a coordenadas del gráfico
function cursorToPlotlyCoords(cursorX, cursorY, boundingBox) {
    const relativeX = cursorX - boundingBox.left;
    const relativeY = cursorY - boundingBox.top;

    const xInPlotly = relativeX / boundingBox.width * (layout.xaxis.range[1] - layout.xaxis.range[0]) + layout.xaxis.range[0];
    const yInPlotly = (boundingBox.height - relativeY) / boundingBox.height * (layout.yaxis.range[1] - layout.yaxis.range[0]) + layout.yaxis.range[0];

    return { x: xInPlotly, y: yInPlotly };
}

export { addElement, removeElement, redrawPlot, updateXAxisRange, cursorToPlotlyCoords };