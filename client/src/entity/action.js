import { filterAction } from '../flow';

export function readDb(flow) {
    return filterAction(flow, 'db');
}

export function readError(flow) {
    return filterAction(flow, 'error');
}

export function readMode(flow) {
    return filterAction(flow, 'mode');
}

export function readSchema(flow) {
    return filterAction(flow, 'schema');
}

export function readSource(flow) {
    return filterAction(flow, 'source');
}

export function readSourceSelectData(flow) {
    return filterAction(flow, 'source:select:data');
}

export function readSourceSelectFilter(flow) {
    return filterAction(flow, 'source:select:filter');
}

export function sendSourceSelectFilterOffsetAction(flow, index, value) {
    flow.next({ action: 'source:select:filter', data: { offset: value } });
}
