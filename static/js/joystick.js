// joystick.js

let joystick;
let cursor;
let graphBounds;
let isMobile = false;

export function initJoystick() {
    checkIfMobile();
    if (isMobile) {
        setupJoystick();
    }
    window.addEventListener('resize', handleResize);
}

function checkIfMobile() {
    const mobileWidth = 1024; // Ajustado para incluir tablets
    isMobile = window.innerWidth <= mobileWidth || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function setupJoystick() {
    cursor = document.getElementById('crosshair-cursor');
    const graphElement = document.getElementById('ecg-plot');
    const joystickZone = document.getElementById('joystick-zone');
    
    if (!cursor || !graphElement || !joystickZone) {
        console.error('Elementos necesarios no encontrados');
        return;
    }

    graphBounds = graphElement.getBoundingClientRect();

    joystick = nipplejs.create({
        zone: joystickZone,
        mode: 'static',
        position: { right: '50%', bottom: '50%' },
        color: 'blue',
        size: 100
    });

    joystick.on('move', handleJoystickMove);
    joystick.on('end', handleJoystickEnd);

    setCursorPosition(
        graphBounds.left + graphBounds.width / 2,
        graphBounds.top + graphBounds.height / 2
    );
}

function handleResize() {
    checkIfMobile();
    
    if (isMobile) {
        if (!joystick) {
            setupJoystick();
        }
    } else {
        if (joystick) {
            joystick.destroy();
            joystick = null;
        }
    }

    if (graphBounds && cursor) {
        const graphElement = document.getElementById('ecg-plot');
        if (graphElement) {
            graphBounds = graphElement.getBoundingClientRect();
            setCursorPosition(parseInt(cursor.style.left), parseInt(cursor.style.top));
        }
    }
}

function handleJoystickMove(evt, data) {
    if (!cursor) return;

    if (data && data.vector) {
        let moveX = data.vector.x * 2;
        let moveY = -data.vector.y * 2;

        let currentX = parseInt(cursor.style.left || 0);
        let currentY = parseInt(cursor.style.top || 0);

        setCursorPosition(currentX + moveX, currentY + moveY);
    }
}

function handleJoystickEnd() {
    // Opcional: implementar comportamiento al soltar el joystick
}

function setCursorPosition(x, y) {
    if (!cursor || !graphBounds) return;

    x = Math.max(graphBounds.left, Math.min(x, graphBounds.right - cursor.offsetWidth));
    y = Math.max(graphBounds.top, Math.min(y, graphBounds.bottom - cursor.offsetHeight));

    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

    // Emitir un evento personalizado con la posición del cursor
    const event = new CustomEvent('cursorMoved', { 
        detail: { 
            x: x - graphBounds.left, 
            y: y - graphBounds.top 
        } 
    });
    window.dispatchEvent(event);
}

export function getCursorPosition() {
    if (!cursor || !graphBounds) return null;

    return {
        x: parseInt(cursor.style.left) - graphBounds.left,
        y: parseInt(cursor.style.top) - graphBounds.top
    };
}

export function destroyJoystick() {
    if (joystick) {
        joystick.destroy();
        joystick = null;
    }
    window.removeEventListener('resize', handleResize);
}

// Función para actualizar los límites del gráfico (útil si el gráfico cambia de tamaño)
export function updateGraphBounds() {
    const graphElement = document.getElementById('ecg-plot');
    if (graphElement) {
        graphBounds = graphElement.getBoundingClientRect();
    }
}