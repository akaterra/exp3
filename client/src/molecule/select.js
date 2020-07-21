import { Select } from '../atom';
import { withBoundary, withLabel } from '../hoc';

const Component = Select;
Component.WithLabel = withBoundary(withLabel(Select));

export default Component;
