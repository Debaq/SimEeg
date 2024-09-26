// orientation.js

let rotateMessage;
let isMobile = false;

export function initOrientationDetection() {
    checkIfMobile();
    createRotateMessage();
    handleOrientationChange(); // Comprueba la orientación inicial
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleResize);
}

function checkIfMobile() {
    const mobileWidth = 768;
    isMobile = window.innerWidth <= mobileWidth || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function handleResize() {
    checkIfMobile();
    handleOrientationChange();
}

function getOrientation() {
    return (window.innerHeight > window.innerWidth) ? "portrait" : "landscape";
}

function handleOrientationChange() {
    const orientation = getOrientation();
    console.log(`La orientación actual es: ${orientation}`);

    if (isMobile) {
        if (orientation === "portrait") {
            document.body.classList.remove('landscape');
            document.body.classList.add('portrait');
            showRotateMessage();
        } else {
            document.body.classList.remove('portrait');
            document.body.classList.add('landscape');
            hideRotateMessage();
        }
    } else {
        hideRotateMessage();
    }

    window.dispatchEvent(new CustomEvent('orientationChanged', { detail: { orientation } }));
}

function createRotateMessage() {
    if (!rotateMessage) {
        rotateMessage = document.createElement('div');
        rotateMessage.id = 'rotate-message';
        rotateMessage.innerHTML = `
            <div class="rotate-content">
                <p>Por favor, gira tu dispositivo para una mejor experiencia.</p>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M7.3 20.5c1.7.4 3.5.5 5.2.3 1.1-.2 2.2-.5 3.3-.9.6-.2 1.2-.5 1.7-.8.6-.3 1.1-.7 1.6-1.1s.9-.9 1.3-1.4c.3-.5.6-1 .8-1.6.2-.6.4-1.2.5-1.8.1-.6.1-1.2.1-1.9 0-1.3-.2-2.6-.7-3.8-.4-1.1-1-2-1.9-2.9-.8-.8-1.8-1.4-2.9-1.9-2.3-.9-4.9-.9-7.2 0C8.3 5.3 7.4 5.9 6.6 6.7c-.9.9-1.5 1.9-1.9 2.9C4.2 11 4 12.3 4 13.6c0 1.3.2 2.6.7 3.8.2.5.5 1.1.8 1.6.3.5.7.9 1.1 1.3.2.2.4.3.7.2zm-2.6-3.9c-.4-1-2.7-8.9 3.6-13.5C9.7 2.2 11.2 2 12.6 2c2.6 0 5.1 1 7 2.8 4.6 4.6 2.6 11.8 2.4 12.6C20.5 20.8 16.8 22 13.1 22h-.4c-5.1 0-7.3-3.5-8-5.4z" fill="currentColor"/>
                </svg>
            </div>
        `;
        document.body.appendChild(rotateMessage);
    }
}

function showRotateMessage() {
    if (rotateMessage) {
        rotateMessage.style.display = 'flex';
    }
}

function hideRotateMessage() {
    if (rotateMessage) {
        rotateMessage.style.display = 'none';
    }
}