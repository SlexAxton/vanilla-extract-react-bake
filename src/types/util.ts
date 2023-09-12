import type { RuntimeFn } from '@vanilla-extract/recipes';
import type { VariantSelection, VariantGroups } from './vendor';
import type {
  ComponentType,
  HTMLAttributes,
  ForwardRefExoticComponent,
  RefAttributes,
  JSX,
} from 'react';

/**
 * `ExtractVariants<R>`
 *
 * This type takes a generic parameter `R` and checks if `R` extends
 * `RuntimeFn<infer Variants>`. A `RuntimeFn` is the output of a vanilla extract 'recipe'.
 * If it is indeed a recipe, it returns `VariantSelection<Variants>`, otherwise it returns `object`.
 * This type is used to extract the variant types from a recipe if they exist. If `object` is returned
 * then it eventually optionally allows any prop.
 *
 * This function is used to determine the variants allowed on a given recipe, and then to enforce
 * those variants as props on the resulting component.
 */
export type ExtractVariants<R> = R extends RuntimeFn<infer Variants>
  ? VariantSelection<Variants>
  : object;

/**
 * `ElementTypeOrComponent`
 *
 * This is a union type that can either be a string representing a JSX intrinsic
 * element (like 'div', 'span', etc.) or a React component type with any props.
 *
 * We use this because we optionally accept either a simple element type string to apply our recipe to,
 * or we accept a component that we want to extend further.
 */
export type ElementTypeOrComponent =
  | keyof JSX.IntrinsicElements
  | ComponentType<any>;

/**
 * `ElementFromComponent<T>`
 *
 * This type takes a generic parameter `T` which extends `ElementTypeOrComponent`. It
 * checks if `T` is a key representing a JSX intrinsic element. If it is, it further checks if it's a
 * key of `HTMLElementTagNameMap` or `SVGElementTagNameMap` and returns the corresponding
 * element type. If `T` is a React component type, it checks if it's a
 * `React.ForwardRefExoticComponent` and returns the inferred element type `E`, otherwise
 * it returns `JSX.Element`.
 *
 * We use this feature to optionally take in a simple element type string to apply our recipe to,
 * or instead passing an existing react component to extend further.
 */
export type ElementFromComponent<T extends ElementTypeOrComponent> =
  T extends keyof JSX.IntrinsicElements
    ? T extends keyof HTMLElementTagNameMap
      ? HTMLElementTagNameMap[T]
      : T extends keyof SVGElementTagNameMap
      ? SVGElementTagNameMap[T]
      : never
    : T extends ComponentType<any>
    ? T extends ForwardRefExoticComponent<RefAttributes<infer E>>
      ? E
      : JSX.Element
    : never;

/**
 * `ViewProps<T>`
 *
 * This type takes a generic parameter `T` which extends `ElementTypeOrComponent`. It checks if
 * `T` is a JSX intrinsic element, if it is, it returns `React.HTMLAttributes<ElementFromComponent<T>>`.
 * If `T` is a React component type, it infers the props `P` of the component and returns `P`.
 *
 * We use this function in order to try to determine the existing allowable props for the provided
 * component or element type string that's provided to the bake function.
 */
export type ViewProps<T extends ElementTypeOrComponent> =
  T extends keyof JSX.IntrinsicElements
    ? HTMLAttributes<ElementFromComponent<T>>
    : T extends ComponentType<infer P>
    ? P
    : never;

/**
 * `RequiredVariants<R, Req>`
 *ƒ
 * This type takes two generic parameters `R` and `Req`. `R` is the type of the recipe and `Req` is an array of strings.
 * It maps over each key `K` in `Req` and checks if `K` is a key of `ExtractVariants<R>`. If it is, it returns the corresponding
 * variant type `ExtractVariants<R>[K]`, otherwise it returns `never`.
 *
 * This type is used to enforce that certain variants are provided when using a recipe. It ensures that the required variants
 * are present in the props of the resulting component.
 */
export type RequiredVariants<R, Req extends Array<keyof ExtractVariants<R>>> = {
  [K in Req[number]]: ExtractVariants<R>[K];
};

/**
 * `CreateViewProps<T, R, _Req>`
 *
 * This type takes three generic parameters `T`, `R`, and `_Req`. `T` extends `ElementTypeOrComponent`, `R` is any type,
 * and `_Req` is an array of strings with a default value of `never`.
 * It combines `ViewProps<T>`, `ExtractVariants<R>`, and `React.RefAttributes<ElementFromComponent<T>>` using intersection (&).
 *
 * `ViewProps<T>` is used to determine the existing allowable props for the provided component or element type string.
 * `ExtractVariants<R>` is used to extract the variant types from a recipe if they exist.
 * `React.RefAttributes<ElementFromComponent<T>>` is used to infer the type of the ref that can be attached to the component.
 *
 * This type is used to create the props for the view component. It ensures that the resulting component accepts the correct
 * props based on the element type, recipe, and required variants.
 */
export type CreateViewProps<
  T extends ElementTypeOrComponent,
  R extends RuntimeFn<VariantGroups> | string = string,
  Req extends Array<keyof ExtractVariants<R>> = never[],
> = ViewProps<T> &
  Partial<ExtractVariants<R>> &
  RequiredVariants<R, Req> &
  React.RefAttributes<ElementFromComponent<T>>;
// & ViewAddedProps; // TODO: add this back in
