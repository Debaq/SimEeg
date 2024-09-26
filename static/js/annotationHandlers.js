import { startAddingMark, startAddingInterval } from './plotInteractionHandlers.js';

export function setupMarkButtons() {
    const markButtons = document.querySelectorAll('.mark-button');
    markButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mark = this.getAttribute('data-mark');
            startAddingMark(mark);
        });
    });
}

export function setupIntervalSelector() {
    document.getElementById('interval-type').addEventListener('change', function() {
        const selectedInterval = this.value;
        startAddingInterval(selectedInterval);
    });
}