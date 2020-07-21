import { Input } from '../atom';
import { withBoundary, withLabel } from '../hoc';

const Component = withBoundary(Input);
Component.WithLabel = withBoundary(withLabel(Input));

export default Component;
