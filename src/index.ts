import { createElement, forwardRef } from 'react';
import mergeProps from 'merge-props';
import { extractVariants } from './extractVariants';

import type { RuntimeFn } from '@vanilla-extract/recipes';
import type { VariantGroups } from './types/vendor';
import type {
  CreateViewOptions,
  CreateViewProps,
  ElementFromComponent,
  ElementTypeOrComponent,
  RequiredVariants,
} from './types/util';

/**
 *
 * @param elementType
 * @param options
 * @returns
 */
export function bake<
  // T is either an element string (e.g. 'div', 'span'), or a reference to a component
  T extends ElementTypeOrComponent = ElementTypeOrComponent,
  // R is either a string (representing a class name) or a runtime function that returns a classname string based on variants
  // specifically, we anticipate that this is the result of a vanilla-extract recipe.
  R extends string | RuntimeFn<VariantGroups> =
    | string
    | RuntimeFn<VariantGroups>,
  // Req is an array of required variant strings
  Req extends string[] = string[],
>(
  // elementType is the type of the element or component
  elementType: T,
  // options can either be a runtime function or an object of CreateViewOptions
  options?: R | CreateViewOptions<R>,
): React.ForwardRefExoticComponent<CreateViewProps<T, R, Req>> {
  // defaultClassNameOrRecipe can either be a string or a runtime function
  let defaultClassNameOrRecipe: R | undefined;

  // If options is an object and not null, assign its recipe to defaultClassNameOrRecipe
  if (typeof options === 'object' && options !== null) {
    defaultClassNameOrRecipe = options.recipe;
  } else {
    // If options is not an object, assign it directly to defaultClassNameOrRecipe
    defaultClassNameOrRecipe = options as R;
  }

  // Create a component with forwardRef
  const Component = forwardRef(function _createView(
    // props are the properties of the component
    props: CreateViewProps<T, R> & RequiredVariants<R, Req>,
    // ref is a reference to the component
    ref: React.Ref<ElementFromComponent<T>>,
  ) {
    // className is either a string or undefined
    let className: string | undefined;
    // filteredProps are the properties after extracting variants
    let filteredProps = props;

    // If defaultClassNameOrRecipe is a string, assign it to className
    if (typeof defaultClassNameOrRecipe === 'string') {
      className = defaultClassNameOrRecipe;
    } else if (defaultClassNameOrRecipe) {
      // If defaultClassNameOrRecipe is not a string, extract variants from it
      const [variants, restProps] = extractVariants(
        props,
        defaultClassNameOrRecipe.variants(),
      );
      // Assign the result of defaultClassNameOrRecipe with variants as argument to className
      className = defaultClassNameOrRecipe(variants);
      // Assign the rest of the properties to filteredProps
      filteredProps = restProps;
    }

    // Destructure as and restProps from filteredProps
    const { as, ...restProps } = filteredProps;
    // actualElementType is either as or elementType
    const actualElementType = as || elementType;

    // Merge className and restProps into mergedProps
    const mergedProps = mergeProps({ className }, restProps);

    // Create an element with actualElementType, mergedProps and ref
    return createElement(actualElementType, { ...mergedProps, ref });
  }) as React.ForwardRefExoticComponent<
    // The component is a forward ref exotic component with CreateViewProps and RequiredVariants
    CreateViewProps<T, R> & RequiredVariants<R, Req>
  >;
  // Return the created component
  return Component;
}
