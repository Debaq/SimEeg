// graphResizeUtility.js

export function adjustGraphSize() {
    const container = document.getElementById('ecg-container');
    const controls = document.getElementById('controls');
    const plot = document.getElementById('ecg-plot');

    if (!container || !controls || !plot) {
        console.warn('No se encontraron todos los elementos necesarios para ajustar el tamaño del gráfico.');
        return;
    }

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const controlsWidth = controls.offsetWidth;
    const controlsHeight = controls.offsetHeight;

    let graphWidth, graphHeight;

    if (window.innerWidth < 768) {
        // Para dispositivos móviles
        graphWidth = containerWidth;
        graphHeight = Math.min(containerHeight - controlsHeight - 20, 300); // Limitamos la altura en móviles
    } else {
        // Para pantallas más grandes
        graphWidth = Math.min(containerWidth - controlsWidth - 40, 800); // Limitamos el ancho máximo
        graphHeight = Math.min(containerHeight - 40, 500); // Limitamos la altura máxima
    }

    // Aseguramos un tamaño mínimo
    graphWidth = Math.max(graphWidth, 300);
    graphHeight = Math.max(graphHeight, 200);

    plot.style.width = `${graphWidth}px`;
    plot.style.height = `${graphHeight}px`;

    // Comprobamos si el gráfico de Plotly ya está inicializado
    if (window.Plotly && plot.layout) {
        Plotly.relayout(plot, {
            width: graphWidth,
            height: graphHeight
        }).catch(error => console.warn('Error al ajustar el tamaño del gráfico:', error));
    } else {
        console.warn('El gráfico de Plotly aún no está inicializado.');
    }

    console.log(`Tamaño del gráfico ajustado a: ${graphWidth}x${graphHeight}`);
}