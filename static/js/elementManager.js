import { addElement, removeElement, redrawPlot } from './utils.js';

let elements = [];
let elementCounter = 0;
let markCounts = {};

export function getElements() {
    return elements;
}

export function addNewElement(type, details) {
    elementCounter = addElement(elements, elementCounter, markCounts, type, details);
    redrawPlot(elements);
}

export function removeElementById(id) {
    elements = removeElement(elements, markCounts, id);
    redrawPlot(elements);
}

export function clearAllElements() {
    elements = [];
    markCounts = {};
    redrawPlot(elements);
}

export function getLastElement() {
    return elements[elements.length - 1];
}

export function removeLastElement() {
    if (elements.length > 0) {
        const lastElement = elements.pop();
        if (lastElement.type === 'mark') {
            const markType = lastElement.details.text.replace(/\d+$/, '');
            markCounts[markType]--;
        }
        redrawPlot(elements);
        return true;
    }
    return false;
}