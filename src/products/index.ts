/** Product registry. Adding a Fluent product = drop a module folder in
 *  src/products/<name>/ and add one import + one array entry here.
 *  Nothing in core or in other product modules changes. */
import type { ProductModule } from '../core/types.js';
import { fluentcrm } from './fluentcrm/index.js';
import { fluentcart } from './fluentcart/index.js';
import { wpsocialninja } from './wpsocialninja/index.js';
import { fluentforms } from './fluentforms/index.js';

export const PRODUCTS: ProductModule[] = [fluentcrm, fluentcart, wpsocialninja, fluentforms];
