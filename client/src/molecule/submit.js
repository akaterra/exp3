import { Submit } from '../atom';
import { withBoundary, withLabel } from '../hoc';

const Component = withBoundary(Submit);
Component.WithLabel = withBoundary(withLabel(Submit));

export default Component;
