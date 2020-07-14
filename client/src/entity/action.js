import { filterAction } from '../flow';

export function readSourceSelectData(flow) {
    return filterAction(flow, 'source:select:data');
}
