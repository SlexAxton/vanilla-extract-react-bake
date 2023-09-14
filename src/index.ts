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
  R extends RuntimeFn<VariantGroups> | Array<string> | string = string,
  Req extends Array<Extract<keyof ExtractVariants<R>, string>> = never[],
>(
  elementType: T,
  recipe?: R,
  config?: { required?: Req; forward?: Req },
): React.ComponentType<CreateViewProps<T, R, Req>> {
  // defaultClassNameOrRecipe can either be a string or a recipe runtime function
  let defaultClassNameOrRecipe: R | undefined = recipe;

  const Component = forwardRef(function BakedComponent(
    props: CreateViewProps<T, R> & RequiredVariants<R, Req>,
    ref: React.Ref<ElementFromComponent<T>>,
  ) {
    let className: string | undefined;
    // filteredProps are the properties after extracting variants
    let filteredProps = props;

    // If defaultClassNameOrRecipe is a string, assign it to className
    if (typeof defaultClassNameOrRecipe === 'string') {
      className = defaultClassNameOrRecipe;
    } else if (Array.isArray(defaultClassNameOrRecipe)) {
      className = defaultClassNameOrRecipe.join(' ');
    } else if (typeof defaultClassNameOrRecipe === 'function') {
      // TODO: after a bunch of refactors, i think there's some redundant prop
      // filtering and merging happening here, even though the outcome is correct.
      const [variants, nonVariantProps] = extractVariants(
        props,
        defaultClassNameOrRecipe.variants(),
      );
      className = defaultClassNameOrRecipe(variants);
      // Merge the restProps with the original props
      filteredProps = { ...props, ...nonVariantProps };
      // Remove any of the variant keys from the eventual
      // props. This is necessary because of intrinsic props
      // that we don't know about at compile time. e.g. data-testid
      const variantKeys = Object.keys(variants);
      for (let i = 0; i < variantKeys.length; i++) {
        const key = variantKeys[i] as Extract<keyof ExtractVariants<R>, string>;
        // If the user has specifically opted to forward the variant along to
        // the component, we'll skip the deletion
        if (!config || !config.forward || !config.forward.includes(key)) {
          delete filteredProps[key];
        }
      }
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
