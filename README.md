# vanilla-extract-react-bake

Heavily inspired by `styled` from `stitches`, this package provides a `bake` function that can be used to generate typed components that reflect a vanilla-extract recipe, where variants are props.

## Installation

```sh
npm install --save vanilla-extract-react-bake
```

## Usage

Create a recipe using `@vanilla-extract/recipes`.

```ts
import { recipe } from '@vanilla-extract/recipes';

export const myRecipe = recipe({
  base: {
    color: 'gray'
  },

  variants: {
    size: {
      small: {
        fontSize: 12
      },
      medium: {
        fontSize: 16
      },
      large: {
        fontSize: 20
      }
    }
  }
});
```

Create a component using `bake` with your recipe.

```tsx
import { bake } from 'vanilla-extract-react-bake';
import { myRecipe } from './myRecipe.css';

export const MyComponent = bake('div', myRecipe);
```

Use that component with props that match the variants in your recipe.

```tsx
import { MyComponent } from './MyComponent';

export const MyApp = () => {
  return (
    <MyComponent size="large">Hello world</MyComponent>
  );
};
```

## Features

### Simple classname components

Since we're already piped to create components with `bake`, we can also use it to create simple components that just have a classname.

```tsx
const MyComponent1 = bake('div');
const MyComponent2 = bake('div', 'some-classname');
const MyComponent3 = bake('button', [
  'my',
  'list',
  'of',
  'classnames'
]);
```

### Regular vanilla extract

Since it works with regular classname, that means we can also use it for regular vanilla extract imports.

```tsx
import { myStyles } from './myStyles.css';

const MyComponent = bake('div', myStyles);
```

### Required variants

I'd love for there to be a way to infer whether a variant is required or not, but that doesn't seem possible with the current types in `vanilla-extract`. So instead, you can mark a variant as required in the config, which is the optional third argument.

```tsx
const MyComponent = bake('div', basic, {
  required: ['requiredVariantName']
});
```

### Variant prop passthrough

By default, we pull out the variants from the props before we spread them onto the resulting component. In the vast majority of cases, this is what you'd want, because there is no html attribute that has the same name as your variant, and you'd make react mad at you.

However, in some cases, you may want to name one of your variants after an html attribute. This tends to happen with `disabled` or `required` or something like that on form elements. For these cases you can use the `forward` config option:

```tsx
const MyComponent = bake('div', basic, {
  forward: ['disabled']
});
```

This will both trigger the `disabled` variant, and pass the `disabled` prop through to the resulting component.

### `as` Runtime base component override

In some cases you want to override the underlying that was extended at runtime. It's not suggested to make large shifts in the base component type, but usually just provide a more specific version of the same thing. Though it also pays off in some cases where you're abstracting over something like a `link` and `button` behind the scenes.

Honestly I don't know how strong the types are when you do this. I'm not smart enough yet to understand how that would work.

You can pass a string

```tsx
const MyComponent = bake('div', basic);

export const MyApp = () => {
  return <MyComponent as="span">Hello world</MyComponent>;
};
```

Or you can pass another component

```tsx
import { Link as NextLink } from 'next/link';
import { Link } from './myBakedLink';

export const MyApp = () => {
  return (
    <Link as={NextLink} href="/some-page">
      Some page
    </Link>
  );
};
```

### Classname merging

The resulting components from `bake` can be used with other classnames, and the resulting classnames will be merged together.

```tsx
const MyComponent = bake('div', 'some-classname');

export const MyApp = () => {
  return <MyComponent className="another-classname" />;
};
```

The resulting html will append them together in the order of the `bake` classname, and then the inlined classname.

## Advanced features that are probably buggy

### `inject`

This feature allows you to inject a prop builder for a custom prop on the resulting component. This is useful for entirely different reasons than most of the rest of the code, but it's nearly free to add to this specific code, so I thought I'd give it a shot.

It's useful when you want your component to have some sort of custom prop, and the value passed to that prop results in values being set on other non-custom props.

```tsx
const MyComponent = bake('div', basic, {
  inject: {
    // This adds a 'css' prop that just passes the
    // value through to the style attribute
    css: (val: React.CSSProperties) => {
      return { style: val };
    }
  }
});

export const MyApp = () => {
  // the `css` prop here is typed as React.CSSProperties
  // from the declaration above in the inject config
  return <MyComponent css={{ color: '#BADA55' }} />;
};
```

This particular example of just 'renaming' the `style` attribute to `css` isn't interesting, but you could imagine that `css` takes in the values from your css-in-js library of choice, and then outputs the actual style values to the `style` attribute, or emits a class to className.

**NOTE**: there's a lot of nuance in the order that injected props are executed and merged together. They also don't have any other introspection into the component values at the moment (e.g. you can't read the value of children and use it to build your result).

### `makeBake`

I think `inject` is quite powerful when you can use it across your entire design system. However, it's a bit of a bummer to need to pass the same `inject` config to every single `bake` call. So I've added a `makeBake` function that allows you to create a `bake` function that has the `inject` config already applied.

```tsx
import { makeBake } from 'vanilla-extract-react-bake';

const myBake = makeBake({
  inject: {
    // This adds a 'css' prop that just passes the
    // value through to the style attribute
    css: (val: React.CSSProperties) => {
      return { style: val };
    }
  }
});

// myBake is now a function that can be used to create components
// just like `bake`, but the `css` injection we did above will
// always be applied to all resulting components
const MyComponent = myBake('div', basic);

export const MyApp = () => {
  // the `css` prop here is typed as React.CSSProperties
  // from the declaration above in the inject config
  return <MyComponent css={{ color: '#BADA55' }} />;
};
```

## Why is this good?

The code for actually building the components is relatively straightforward, and is only a few lines of code. The primary benefit here is the type safety that comes with it. Much like with `vanilla-extract` directly, a large amount of your code is built out at compile time. So you ship less javascript to the client, you have types that never drift from your styles, and you have to write less code by hand.

It's primarily good for folks who spend a lot of time reimplementing their style variants as javascript props on their components, a common job for people making design systems, or just reusable components in general. `bake` allows you to have a single place where your variants are defined, and then outputs a very well-typed component that can be used with those variants, and updates when the variants change.

It's especially apparent when you look at the intellisense for components that come out of `bake`.

### A basic recipe with one variant

![A basic recipe with color variant and values: red and blue](readme_assets/bake_00.png)

### The variants are now known, and the config can be used to mark some of them as required

![Typescript intellisense showing a red line under baked component](readme_assets/bake_01.png)

### The error describes the specific prop that is missing

![Typescript intellisense showing the missing required prop 'color'](readme_assets/bake_02.png)

### IntelliSense for the component itself shows the variants and their values

![Typescript intellisense showing the variants](readme_assets/bake_03.png)

![Typescript intellisense showing the values of variants](readme_assets/bake_04.png)

```

```
