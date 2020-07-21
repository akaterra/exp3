import { ActionList } from '../atom';
import { withBoundary, withLabel } from '../hoc';

const Component = withBoundary(ActionList);
Component.WithLabel = withBoundary(withLabel(ActionList));

export default Component;
