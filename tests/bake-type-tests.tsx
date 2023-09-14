/*
    This file is for validating types, it is not designed to be executed
*/
import { bake } from '../src/index';
import { basic } from './recipes.css';

// Test that our most simple case is handled, a string element
// with no recipe or class applied.
const PassThroughComponent = bake('div');
export const PassThroughComponentTest = () => {
  return <PassThroughComponent />;
};

// Test that a string className can be set as the second argument
// to bake
const StringClassComponent = bake('div', 'string-class');
export const StringClassComponentTest = () => {
  return <StringClassComponent />;
};

// Test that bake accepts a component as the first argument
const ComponentComponent = bake(StringClassComponent);
export const ComponentComponentTest = () => {
  return <ComponentComponent />;
};

// Test that an array of string classNames can be set as the second argument
// to bake
const StringClassArrayComponent = bake('div', [
  'string-class-a',
  'string-class-b',
]);
export const StringClassArrayComponentTest = () => {
  return <StringClassArrayComponent />;
};

// Test that bake accepts a class string as the second argument
// when a component is provided as the first argument
const ComponentStringClassComponent = bake(
  StringClassComponent,
  'string-class2',
);
export const ComponentStringClassComponentTest = () => {
  if (Math.random() > 0.5) {
    // Also make sure that we can still add classes to the resulting component
    return <ComponentStringClassComponent className="additional-class" />;
  }

  return <ComponentStringClassComponent />;
};

// Test that bake accepts an array of class strings as the second argument
// when a component is provided as the first argument
const ComponentStringArrayClassComponent = bake(StringClassComponent, [
  'string-class3-a',
  'string-class3-b',
]);

export const ComponentStringArrayClassComponentTest = () => {
  if (Math.random() > 0.5) {
    // Also make sure that we can still add classes to the resulting component
    return <ComponentStringArrayClassComponent className="additional-class" />;
  }

  return <ComponentStringArrayClassComponent />;
};

// Test that a recipe can be applied to a string element
// and that a working component is returned that has the
// variants as props
const BasicRecipeComponent = bake('div', basic);
const BasicRecipeExtendedComponent = bake(ComponentStringClassComponent, basic);

// The `variant` prop here is just setup so we can run multiple tests
// in this function body
export const RecipeComponentTest = ({
  variant,
  type,
}: {
  variant: string;
  type: string;
}) => {
  if (variant === 'small space with default') {
    if (type === 'string') {
      return <BasicRecipeComponent spaceWithDefault="small" />;
    }
    return <BasicRecipeExtendedComponent spaceWithDefault="small" />;
  }

  if (variant === 'large space with default') {
    if (type === 'string') {
      return <BasicRecipeComponent spaceWithDefault="large" />;
    }
    return <BasicRecipeExtendedComponent spaceWithDefault="large" />;
  }

  if (variant === 'prop value doesnt exist') {
    if (type === 'string') {
      // @ts-expect-error Type '"doesntExist"' is not assignable to type '"small" | "large" | undefined'.
      return <BasicRecipeComponent spaceWithDefault="doesntExist" />;
    }
    // @ts-expect-error Type '"doesntExist"' is not assignable to type '"small" | "large" | undefined'.
    return <BasicRecipeExtendedComponent spaceWithDefault="doesntExist" />;
  }

  if (variant === 'invalid prop') {
    if (type === 'string') {
      // @ts-expect-error Type '{ invalidProp: string; }' is not assignable to…
      return <BasicRecipeComponent invalidProp="doesntExist" />;
    }
    // @ts-expect-error Type '{ invalidProp: string; }' is not assignable to…
    return <BasicRecipeExtendedComponent invalidProp="doesntExist" />;
  }

  if (variant === 'multiple variants') {
    if (type === 'string') {
      return <BasicRecipeComponent color="red" spaceWithDefault="small" />;
    }
    return (
      <BasicRecipeExtendedComponent color="red" spaceWithDefault="small" />
    );
  }

  if (variant === 'boolean variant') {
    if (type === 'string') {
      return <BasicRecipeComponent rounded />;
    }
    return <BasicRecipeExtendedComponent rounded />;
  }

  // Default usage
  if (type === 'string') {
    return <BasicRecipeComponent />;
  }
  return <BasicRecipeExtendedComponent />;
};

const ComplexRecipeComponent = bake('div', basic, {
  required: ['color'],
});

export const ComplexRecipeComponent2 = bake('div', basic, {
  // @ts-expect-error Should only allow actual variant keys from the recipe
  required: ['not a variant'],
});

export const ComplexRecipeComponentTest = () => {
  const rnd = Math.random();

  // Make sure the component throws an error if we leave out a required prop
  if (rnd === 0.1) {
    // @ts-expect-error Property 'color' is missing in type '{}' but required in type…
    return <ComplexRecipeComponent />;
  }

  // It should allow additional valid props
  if (rnd === 0.2) {
    return <ComplexRecipeComponent color="red" rounded />;
  }

  // It should not allow invalid props
  if (rnd === 0.3) {
    // @ts-expect-error Type '{ color: "red"; invalidProp: string; }' is not assignable to…
    return <ComplexRecipeComponent color="red" invalidProp="invalid" />;
  }

  return <ComplexRecipeComponent color="red" />;
};
