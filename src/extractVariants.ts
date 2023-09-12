import type {
  ElementTypeOrComponent,
  CreateViewProps,
  ExtractVariants,
} from './types/util';
import type { VariantGroups, VariantSelection } from './types/vendor';
import type { RuntimeFn } from '@vanilla-extract/recipes';

/**
 * This function extracts variants from the props and filters out the remaining props.
 * It is useful when you want to separate out variant keys from the rest of the props.
 * The function takes in props and variantKeys as parameters.
 * It returns an array containing the extracted variants and the filtered props.
 */
export function extractVariants<
  T extends ElementTypeOrComponent,
  R extends RuntimeFn<VariantGroups> | string,
  Req extends Array<Extract<keyof ExtractVariants<R>, string>> = never[],
>(
  props: CreateViewProps<T, R, Req>,
  variantKeys: (keyof VariantGroups)[],
): [VariantSelection<VariantGroups>, CreateViewProps<T, R, Req>] {
  const variants: VariantSelection<VariantGroups> = {};
  const filteredProps: Record<string, any> = {};

  // Loop through each variant key
  for (let i = 0; i < variantKeys.length; i++) {
    const key = variantKeys[i];
    // if the key is a prop, add it to the variants object, otherwise add it to filteredProps
    if (props.hasOwnProperty(key)) {
      variants[key] = props[key];
    } else {
      filteredProps[key] = props[key];
    }
  }

  // Return a separated list of variants an props
  return [variants, filteredProps as CreateViewProps<T, R, Req>];
}
