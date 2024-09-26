import { addNewElement } from './elementManager.js';
import { measurementColors } from './config.js';

let measuring = false;
let addingMark = false;
let addingInterval = false;
let selectedMark = '';
let selectedInterval = '';
let measurementIndex = 0;

export function handlePlotlyRelayout(eventdata) {
    let fullLayout = document.getElementById('ecg-plot').layout;
    let shapes = fullLayout.shapes || [];
    let annotations = fullLayout.annotations || [];

    if (measuring && shapes.length > 0) {
        handleMeasurement(shapes[shapes.length - 1]);
    }

    if (addingInterval && shapes.length > 0) {
        handleInterval(shapes[shapes.length - 1]);
    }

    if (addingMark && annotations.length > 0) {
        handleMark(annotations[annotations.length - 1]);
    }
}

function handleMeasurement(shape) {
    if (shape.type === 'line') {
        let { x0, y0, x1, y1 } = shape;
        let deltaX = x1 - x0;
        let deltaY = y1 - y0;
        let deltaYMicroV = deltaY * 1000;
        let measurementText = `(${deltaX.toFixed(2)} s / ${deltaYMicroV.toFixed(2)} µV)`;

        shape.line.color = measurementColors[measurementIndex % measurementColors.length];
        shape.line.width = 2;

        let annotation = {
            x: (x0 + x1) / 2,
            y: Math.max(y0, y1) + 0.1,
            text: measurementText,
            showarrow: false,
            font: { color: 'black', size: 12 },
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            bordercolor: 'black',
            borderwidth: 1
        };

        addNewElement('measurement', { shape, annotation, text: measurementText });

        measurementIndex++;
        measuring = false;
        Plotly.relayout('ecg-plot', { dragmode: 'zoom' });
    }
}

function handleInterval(shape) {
    if (shape.type === 'line') {
        let { x0, y0, x1, y1 } = shape;
        let deltaX = x1 - x0;
        let measurementText = `${selectedInterval}: ${deltaX.toFixed(2)} s`;

        shape.line.color = 'blue';
        shape.line.width = 2;

        let annotation = {
            x: (x0 + x1) / 2,
            y: Math.max(y0, y1) + 0.1,
            text: measurementText,
            showarrow: false,
            font: { color: 'blue', size: 12 },
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            bordercolor: 'blue',
            borderwidth: 1
        };

        addNewElement('interval', { shape, annotation, text: measurementText });

        addingInterval = false;
        selectedInterval = '';
        document.getElementById('interval-type').value = '';
        Plotly.relayout('ecg-plot', { dragmode: 'zoom' });
    }
}

function handleMark(annotation) {
    selectedMark = selectedMark || 'Mark';
    if (!markCounts[selectedMark]) {
        markCounts[selectedMark] = 0;
    }
    markCounts[selectedMark]++;

    annotation.text = `${selectedMark}${markCounts[selectedMark]}`;
    annotation.font = { color: 'black', size: 14 };
    annotation.showarrow = true;
    annotation.arrowhead = 2;
    annotation.arrowsize = 1;
    annotation.arrowwidth = 2;
    annotation.arrowcolor = 'black';
    annotation.ax = 0;
    annotation.ay = -30;

    addNewElement('mark', { annotation, text: annotation.text });

    addingMark = false;
    selectedMark = '';
    Plotly.relayout('ecg-plot', { dragmode: 'zoom' });
}

export function startMeasuring() {
    measuring = true;
    addingMark = false;
    addingInterval = false;
    selectedMark = '';
    selectedInterval = '';
    Plotly.relayout('ecg-plot', { dragmode: 'drawline' });
}

export function startAddingMark(mark) {
    selectedMark = mark;
    addingMark = true;
    measuring = false;
    addingInterval = false;
    selectedInterval = '';
    Plotly.relayout('ecg-plot', { dragmode: 'drawtext' });
}

export function startAddingInterval(interval) {
    selectedInterval = interval;
    if (selectedInterval !== '') {
        addingInterval = true;
        addingMark = false;
        measuring = false;
        selectedMark = '';
        Plotly.relayout('ecg-plot', { dragmode: 'drawline' });
    } else {
        addingInterval = false;
        Plotly.relayout('ecg-plot', { dragmode: 'zoom' });
    }
}