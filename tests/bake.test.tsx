/**
 * @jest-environment jsdom
 */
import type { HTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import { basic } from './recipes.css';
import { bake, makeBake } from '../src/index';

const DivComponent = (props: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} />
);

describe('bake', () => {
  describe('basic', () => {
    it('should return a component when only one string element is provided', async () => {
      // These use the minimum viable api for bake where no classnames or recipes
      // are provided
      const Component = bake('div');
      const BtnComponent = bake('button');

      render(
        <>
          <BtnComponent data-testid="bake-1-btn">test button</BtnComponent>
          <Component data-testid="bake-1-div">test content</Component>
        </>,
      );

      const cmpnt = screen.getByTestId('bake-1-div');
      const btn = screen.getByTestId('bake-1-btn');

      // This verifies that the component is rendered and that the content
      // is correct, and also that the tagname is correct, since that's the
      // primary purpose of calling bake with a single string argument
      expect(cmpnt).toBeInTheDocument();
      expect(btn).toBeInTheDocument();
      expect(cmpnt).toHaveTextContent('test content');
      expect(btn).toHaveTextContent('test button');
      expect(cmpnt.tagName).toBe('DIV');
      expect(btn.tagName).toBe('BUTTON');
    });

    it('should add a className to the component if the second arg is a string', async () => {
      const Component = bake('div', 'test-class');

      render(<Component data-testid="bake-2-div" />);

      expect(screen.getByTestId('bake-2-div')).toHaveClass('test-class');
    });

    it('should add a set of classNames to the component if the second arg is an array of strings', async () => {
      const Component = bake('div', ['test-class-1', 'test-class-2']);

      render(<Component data-testid="bake-7-div" />);

      expect(screen.getByTestId('bake-7-div')).toHaveClass(
        'test-class-1 test-class-2',
      );
    });

    it('should allow the resulting component to merge class names on top of the provided ones', async () => {
      const Component = bake('div', 'test-class');

      render(<Component data-testid="bake-2-div" className="extra-class" />);

      // Checking these together also verifies that the merged classnames
      // are injected after the default ones. This doesn't end up mattering
      // much but it feels important to specify a specific behavior.
      expect(screen.getByTestId('bake-2-div')).toHaveClass(
        'test-class extra-class',
      );
    });

    it('should take an existing component as the first argument and extend it', async () => {
      const Component = bake(DivComponent, 'test-class');

      render(
        <Component data-testid="bake-3-div" className="additional-class">
          test content
        </Component>,
      );

      expect(screen.getByTestId('bake-3-div')).toHaveClass('test-class');
      expect(screen.getByTestId('bake-3-div')).toHaveClass('additional-class');
    });
  });

  describe('recipes', () => {
    it('should apply the variants in a recipe as props to the resulting component', async () => {
      const Component = bake('div', basic);

      render(<Component data-testid="bake-4-div" rounded />);

      const elem = screen.getByTestId('bake-4-div');

      expect(elem).toBeInTheDocument();

      // It should have the classname for the `rounded` prop we gave it
      expect(elem.className).toEqual(
        expect.stringContaining('recipes_basic_rounded_true'),
      );

      // It should also have the classname for the default variant
      expect(elem.className).toEqual(
        expect.stringContaining('recipes_basic_spaceWithDefault_small'),
      );
    });

    it('should not add variant props as props on the underlying component', async () => {
      const Component = bake('div', basic);

      render(<Component data-testid="bake-5-div" disabled />);

      const elem = screen.getByTestId('bake-5-div');

      expect(elem).toBeInTheDocument();
      expect(elem.getAttribute('disabled')).toBeNull();
      expect(elem.getAttribute('disabled')).not.toEqual('');
    });

    it('should forward variant props as props on the underlying component if configured', async () => {
      const Component = bake('div', basic, {
        forward: ['disabled'],
      });

      render(<Component data-testid="bake-5-div" disabled />);

      const elem = screen.getByTestId('bake-5-div');

      expect(elem).toBeInTheDocument();
      expect(elem.getAttribute('disabled')).not.toBeNull();
      expect(elem.getAttribute('disabled')).toEqual('');
    });

    it('should allow the `as` prop on the resulting component to change the underlying element', async () => {
      const Component = bake('div', basic);

      render(<Component data-testid="bake-8-div" as="button" />);

      const elem = screen.getByTestId('bake-8-div');

      expect(elem).toBeInTheDocument();
      expect(elem.tagName).toEqual('BUTTON');
    });

    it('should allow a component in the as prop as well', async () => {
      const AltComponent = bake('button', 'foo-class');
      const Component = bake('div', basic);

      render(
        <Component
          data-testid="bake-8-div"
          as={AltComponent}
          color="blue"
          className="inline-class"
        />,
      );

      const elem = screen.getByTestId('bake-8-div');

      expect(elem).toBeInTheDocument();
      expect(elem.tagName).toEqual('BUTTON');
      expect(elem).toHaveClass('foo-class');
      expect(elem).toHaveClass('inline-class');
      expect(elem.className).toEqual(expect.stringContaining('color_blue'));
    });

    it('should allow an optional config object that allows you to specific required variant props', async () => {
      const Component = bake('div', basic, {
        required: ['color'],
      });

      render(<Component data-testid="bake-6-div" color="blue" />);

      const elem = screen.getByTestId('bake-6-div');

      expect(elem).toBeInTheDocument();
      expect(elem.className).toEqual(expect.stringContaining('color_blue'));
    });
  });

  describe('advanced', () => {
    it('should allow you to inject additional props into the resulting component', async () => {
      const Component = bake('div', basic, {
        inject: {
          // This adds a 'css' prop that just passes the value through to the style attribute
          css: (val: React.CSSProperties) => {
            return { style: val };
          },
        },
      });

      render(<Component data-testid="bake-9-div" css={{ color: '#BADA55' }} />);

      const elem = screen.getByTestId('bake-9-div');
      expect(elem).toHaveStyle({ color: '#BADA55' });
    });

    it('should allow you to make your own bake function with makeBake that has built in injections', async () => {
      const myBake = makeBake({
        // This adds a 'css' prop that just passes the value through to the style attribute
        css: (val: React.CSSProperties) => {
          return { style: val };
        },
      });

      const Component = myBake('div', basic);

      render(
        <Component data-testid="bake-10-div" css={{ color: '#BADA66' }} />,
      );

      const elem = screen.getByTestId('bake-10-div');
      expect(elem).toHaveStyle({ color: '#BADA66' });
    });

    it('should merge props nicely if they are there from injection', async () => {
      const myBake = makeBake({
        css: (classAddition: string) => {
          return { className: `fromMakeInject-${classAddition}` };
        },
      });

      const Component = myBake('div', basic);

      render(
        <Component
          data-testid="bake-10-div"
          css="foo"
          className="inline-class"
        />,
      );

      const elem = screen.getByTestId('bake-10-div');
      expect(elem).toHaveClass('fromMakeInject-foo');
      expect(elem).toHaveClass('inline-class');
    });

    it('should prefer component inject over makebake inject if there are collisions', async () => {
      const myBake = makeBake({
        // This adds a 'css' prop that just passes the value through to the style attribute
        css: (val: React.CSSProperties) => {
          return { style: val };
        },
      });

      const Component = myBake('div', basic, {
        inject: {
          css: (val: string) => {
            return { 'data-css': val };
          },
        },
      });

      render(<Component data-testid="bake-10-div" css="its the string one" />);

      const elem = screen.getByTestId('bake-10-div');
      expect(elem.getAttribute('data-css')).toEqual('its the string one');
    });
  });
});
