import { createElement, forwardRef } from 'react';
import mergeProps from 'merge-props';
import { extractVariants } from './extractVariants';

import type { RuntimeFn } from '@vanilla-extract/recipes';
import type { VariantGroups } from './types/vendor';

import type {
  CreateViewProps,
  ElementFromComponent,
  ElementTypeOrComponent,
  ExtractVariants,
  RequiredVariants,
} from './types/util';

export function bake<
  T extends ElementTypeOrComponent,
  R extends RuntimeFn<VariantGroups> | string = string,
  Req extends Array<Extract<keyof ExtractVariants<R>, string>> = never[],
>(
  elementType: T,
  recipe?: R,
  // Currently _config is not actually used at runtime, but it is used in the type system
  // Presumably in the near future we'll use it for something else at runtime.
  _config?: { required?: Req },
): React.ComponentType<CreateViewProps<T, R, Req>> {
  // defaultClassNameOrRecipe can either be a string or a runtime function
  let defaultClassNameOrRecipe: R | undefined = recipe;

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
    } else if (typeof defaultClassNameOrRecipe === 'function') {
      const [variants, restProps] = extractVariants(
        props,
        defaultClassNameOrRecipe.variants(),
      );
      className = defaultClassNameOrRecipe(variants);
      // Merge the restProps with the original props
      filteredProps = { ...props, ...restProps };
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
