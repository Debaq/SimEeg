import { getCursorPosition } from './joystick.js';

let floatingClickButton;
let isMobile = false;

export function initFloatingClick() {
    floatingClickButton = document.getElementById('floating-click');
    checkIfMobile();
    if (isMobile) {
        showFloatingClick();
        floatingClickButton.addEventListener('click', handleFloatingClick);
    }
    window.addEventListener('resize', handleResize);
}

function checkIfMobile() {
    const mobileWidth = 768;
    isMobile = window.innerWidth <= mobileWidth || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function showFloatingClick() {
    if (floatingClickButton) {
        floatingClickButton.style.display = 'block';
    }
}

function hideFloatingClick() {
    if (floatingClickButton) {
        floatingClickButton.style.display = 'none';
    }
}

function handleFloatingClick() {
    const cursorPosition = getCursorPosition();
    if (cursorPosition) {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: cursorPosition.x,
            clientY: cursorPosition.y
        });
        const plotElement = document.getElementById('ecg-plot');
        if (plotElement) {
            plotElement.dispatchEvent(clickEvent);
        }
    }
}

function handleResize() {
    checkIfMobile();
    if (isMobile) {
        showFloatingClick();
    } else {
        hideFloatingClick();
    }
}