
document.addEventListener('DOMContentLoaded', function () {
    let isDataFlowing = true;
    let startTime = null;

    const layout = {
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

    const config = {
        responsive: true,
        scrollZoom: false,
        displayModeBar: true,
        displaylogo: false,
        editable: true,
        modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d']
    };

    Plotly.newPlot('ecg-plot', [{
        x: [],
        y: [],
        type: 'scatter',
        mode: 'lines',
        line: { color: '#00b300', width: 1.5 }
    }], layout, config);

    function updateECG() {
        if (!isDataFlowing) return;
        fetch('/data')
            .then(response => response.json())
            .then(data => {
                if (startTime === null) {
                    startTime = data.x[0];
                }

                let adjustedX = data.x.map(x => x - startTime);

                Plotly.extendTraces('ecg-plot', {
                    x: [adjustedX.slice(-1)],
                    y: [data.y.slice(-1)]
                }, [0]);

                let currentTime = adjustedX[adjustedX.length - 1];
                if (currentTime > 5) {
                    Plotly.relayout('ecg-plot', {
                        'xaxis.range': [currentTime - 5, currentTime]
                    });
                }
            });
    }

    setInterval(updateECG, 10);

    // Variables para seguimiento de mediciones y anotaciones
    let measuring = false;
    let addingMark = false;
    let addingInterval = false;
    let selectedMark = '';
    let selectedInterval = '';
    let measurementIndex = 0;
    let measurementShapes = [];
    let measurementAnnotations = [];
    let previousShapesLength = 0;
    let labelAnnotations = [];
    let previousAnnotationsLength = 0;
    const measurementColors = ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF'];

    // Variables para el manejo de elementos
    let elements = [];
    let elementCounter = 0;
    let markCounts = {};

    // Función para añadir un elemento
    function addElement(type, details) {
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
    }

    // Función para eliminar un elemento
    function removeElement(id) {
        const index = elements.findIndex(el => el.id === id);
        if (index !== -1) {
            const element = elements[index];
            if (element.type === 'mark') {
                const markType = element.details.text.replace(/\d+$/, '');
                markCounts[markType]--;
            }
            elements.splice(index, 1);
            updateElementsList();
            redrawPlot();
        }
    }

    // Función para actualizar la lista de elementos en la ventana emergente
    function updateElementsList() {
        const list = document.getElementById('elements-list');
        list.innerHTML = '';
        elements.forEach(el => {
            const li = document.createElement('li');
            li.textContent = `${el.type}: ${el.details.text}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.onclick = () => removeElement(el.id);
            li.appendChild(deleteButton);
            list.appendChild(li);
        });
    }

    // Función para redibujar el gráfico
    function redrawPlot() {
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

    // Evento del botón "Medir Distancia"
    document.getElementById('measure').addEventListener('click', function () {
        measuring = true;
        addingMark = false;
        addingInterval = false;
        selectedMark = '';
        selectedInterval = '';
        Plotly.relayout('ecg-plot', { dragmode: 'drawline' });
    });

    // Eventos para los botones de marcas
    const markButtons = document.querySelectorAll('.mark-button');
    markButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            selectedMark = this.getAttribute('data-mark');
            addingMark = true;
            measuring = false;
            addingInterval = false;
            selectedInterval = '';
            Plotly.relayout('ecg-plot', { dragmode: 'drawtext' });
        });
    });

    // Evento del selector de intervalos
    document.getElementById('interval-type').addEventListener('change', function () {
        selectedInterval = this.value;
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
    });

    // Evento plotly_relayout para detectar nuevas formas o anotaciones
    document.getElementById('ecg-plot').on('plotly_relayout', function (eventdata) {
        let fullLayout = document.getElementById('ecg-plot').layout;
        let shapes = fullLayout.shapes || [];
        let annotations = fullLayout.annotations || [];

        // Manejo de mediciones
        if (measuring) {
            if (shapes.length > previousShapesLength) {
                let lastShape = shapes[shapes.length - 1];

                if (lastShape.type === 'line') {
                    let x0 = lastShape.x0;
                    let y0 = lastShape.y0;
                    let x1 = lastShape.x1;
                    let y1 = lastShape.y1;

                    let deltaX = x1 - x0;
                    let deltaY = y1 - y0;
                    let deltaYMicroV = deltaY * 1000;

                    let deltaXFormatted = deltaX.toFixed(2) + ' s';
                    let deltaYFormatted = deltaYMicroV.toFixed(2) + ' µV';
                    let measurementText = '(' + deltaXFormatted + ' / ' + deltaYFormatted + ')';

                    let annotationX = (x0 + x1) / 2;
                    let annotationY = Math.max(y0, y1) + 0.1;

                    lastShape.line.color = measurementColors[measurementIndex % measurementColors.length];
                    lastShape.line.width = 2;

                    let annotation = {
                        x: annotationX,
                        y: annotationY,
                        text: measurementText,
                        showarrow: false,
                        font: { color: 'black', size: 12 },
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        bordercolor: 'black',
                        borderwidth: 1
                    };

                    addElement('measurement', {
                        shape: lastShape,
                        annotation: annotation,
                        text: measurementText
                    });

                    measurementIndex++;
                    measuring = false;
                    previousShapesLength = shapes.length;

                    Plotly.relayout('ecg-plot', { dragmode: 'zoom' });
                    redrawPlot();
                }
            }
        }

        // Manejo de intervalos y segmentos
        if (addingInterval) {
            if (shapes.length > previousShapesLength) {
                let lastShape = shapes[shapes.length - 1];

                if (lastShape.type === 'line') {
                    let x0 = lastShape.x0;
                    let y0 = lastShape.y0;
                    let x1 = lastShape.x1;
                    let y1 = lastShape.y1;

                    let deltaX = x1 - x0;
                    let deltaXFormatted = deltaX.toFixed(2) + ' s';

                    let measurementText = selectedInterval + ': ' + deltaXFormatted;

                    let annotationX = (x0 + x1) / 2;
                    let annotationY = Math.max(y0, y1) + 0.1;

                    lastShape.line.color = 'blue';
                    lastShape.line.width = 2;

                    let annotation = {
                        x: annotationX,
                        y: annotationY,
                        text: measurementText,
                        showarrow: false,
                        font: { color: 'blue', size: 12 },
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        bordercolor: 'blue',
                        borderwidth: 1
                    };

                    addElement('interval', {
                        shape: lastShape,
                        annotation: annotation,
                        text: measurementText
                    });

                    addingInterval = false;
                    selectedInterval = '';
                    previousShapesLength = shapes.length;
                    document.getElementById('interval-type').value = '';

                    Plotly.relayout('ecg-plot', { dragmode: 'zoom' });
                    redrawPlot();
                }
            }
        }

        // Manejo de marcas
        if (addingMark) {
            if (annotations.length > previousAnnotationsLength) {
                let lastAnnotation = annotations[annotations.length - 1];

                if (!markCounts[selectedMark]) {
                    markCounts[selectedMark] = 0;
                }
                markCounts[selectedMark]++;

                lastAnnotation.text = `${selectedMark}${markCounts[selectedMark]}`;
                lastAnnotation.font = { color: 'black', size: 14 };
                lastAnnotation.showarrow = true;
                lastAnnotation.arrowhead = 2;
                lastAnnotation.arrowsize = 1;
                lastAnnotation.arrowwidth = 2;
                lastAnnotation.arrowcolor = 'black';
                lastAnnotation.ax = 0;
                lastAnnotation.ay = -30;

                addElement('mark', {
                    annotation: lastAnnotation,
                    text: lastAnnotation.text
                });

                addingMark = false;
                selectedMark = '';
                previousAnnotationsLength = annotations.length;

                Plotly.relayout('ecg-plot', { dragmode: 'zoom' });
                redrawPlot();
            }
        }
    });

    // Evento para detener o reanudar datos
    document.getElementById('toggle-data').addEventListener('click', function () {
        isDataFlowing = !isDataFlowing;
        this.textContent = isDataFlowing ? 'Detener Datos' : 'Reanudar Datos';
    });

    // Evento para exportar imagen
    document.getElementById('export-image').addEventListener('click', function () {
        Plotly.toImage('ecg-plot', { format: 'png', width: 800, height: 600 }).then(function (dataUrl) {
            const link = document.createElement('a');
            link.download = 'ecg_plot.png';
            link.href = dataUrl;
            link.click();
        });
    });

    // Evento para eliminar la última anotación
    document.getElementById('delete-last-annotation').addEventListener('click', function () {
        if (elements.length > 0) {
            const lastElement = elements.pop();
            if (lastElement.type === 'mark') {
                const markType = lastElement.details.text.replace(/\d+$/, '');
                markCounts[markType]--;
            }
            redrawPlot();
            updateElementsList();
        } else {
            alert('No hay anotaciones para eliminar.');
        }
    });

    // Evento para eliminar todas las anotaciones
    document.getElementById('delete-all-annotations').addEventListener('click', function () {
        if (elements.length > 0) {
            elements = [];
            markCounts = {};
            redrawPlot();
            updateElementsList();
        } else {
            alert('No hay anotaciones para eliminar.');
        }
    });

    // Evento para abrir la ventana emergente
    document.getElementById('manage-elements').addEventListener('click', function () {
        updateElementsList();
        document.getElementById('popup-window').style.display = 'block';
        document.getElementById('ecg-plot').style.display = 'none';
    });

    // Evento para cerrar la ventana emergente
    document.getElementById('close-popup').addEventListener('click', function () {
        document.getElementById('popup-window').style.display = 'none';
        document.getElementById('ecg-plot').style.display = 'block';
        redrawPlot();  // Redibujar el gráfico al cerrar la ventana emergente
    });

    // Implementación del joystick para mover el cursor
    const joystick = nipplejs.create({
        zone: document.getElementById('joystick-zone'),
        mode: 'static',
        position: { left: '50px', bottom: '50px' },
        color: 'blue',
        size: 100
    });

    joystick.on('move', function (evt, data) {
        const cursor = document.getElementById('crosshair-cursor');
        cursor.style.display = 'block';

        if (data && data.angle) {
            let moveX = Math.cos(data.angle.radian) * data.distance * 0.1;
            let moveY = - Math.sin(data.angle.radian) * data.distance * 0.1;

            let currentX = parseInt(cursor.style.left || 0);
            let currentY = parseInt(cursor.style.top || 0);

            cursor.style.left = (currentX + moveX) + 'px';
            cursor.style.top = (currentY + moveY) + 'px';
        }
    });

    // Evento para seleccionar un punto en el gráfico
    document.getElementById('select-point').addEventListener('click', function () {
        const cursor = document.getElementById('crosshair-cursor');
        const plot = document.getElementById('ecg-plot');
        const boundingBox = plot.getBoundingClientRect();

        let cursorX = parseInt(cursor.style.left);
        let cursorY = parseInt(cursor.style.top);

        if (cursorX >= boundingBox.left && cursorX <= boundingBox.right &&
            cursorY >= boundingBox.top && cursorY <= boundingBox.bottom) {

            const relativeX = cursorX - boundingBox.left;
            const relativeY = cursorY - boundingBox.top;

            const xInPlotly = relativeX / boundingBox.width * (layout.xaxis.range[1] - layout.xaxis.range[0]) + layout.xaxis.range[0];
            const yInPlotly = (boundingBox.height - relativeY) / boundingBox.height * (layout.yaxis.range[1] - layout.yaxis.range[0]) + layout.yaxis.range[0];

            if (!markCounts[selectedMark]) {
                markCounts[selectedMark] = 0;
            }
            markCounts[selectedMark]++;

            const annotation = {
                x: xInPlotly,
                y: yInPlotly,
                text: `${selectedMark}${markCounts[selectedMark]}`,
                showarrow: true,
                arrowhead: 2,
                ax: 0,
                ay: -20
            };

            addElement('mark', {
                annotation: annotation,
                text: annotation.text
            });

            redrawPlot();
        }
    });

    // Ajustar el gráfico al redimensionar la ventana
    window.addEventListener('resize', function () {
        Plotly.Plots.resize('ecg-plot');
    });
});