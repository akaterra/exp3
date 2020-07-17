import { filterAction } from '../flow';

export function readMode(flow) {
    return filterAction(flow, 'mode');
}

export function readSourceSelectData(flow) {
    return filterAction(flow, 'source:select:data');
}
