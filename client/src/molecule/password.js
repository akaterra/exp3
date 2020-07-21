import { Password } from '../atom';
import { withBoundary, withLabel } from '../hoc';

const Component = withBoundary(Password);
Component.WithLabel = withBoundary(withLabel(Password));

export default Component;
