import { filterAction } from '../flow';

export function readMode(flow) {
    return filterAction(flow, 'mode');
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
