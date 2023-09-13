/**
 * @jest-environment jsdom
 */
import type { HTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import { basic } from './recipes.css';
import { bake } from '../src/index';

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

    it('should allow an optional config object that allows you to specific required variant props', async () => {
      const Component = bake(DivComponent, basic, {
        required: ['color'],
      });

      render(<Component data-testid="bake-5-div" color="blue" />);

      const elem = screen.getByTestId('bake-5-div');

      expect(elem).toBeInTheDocument();
      expect(elem.className).toEqual(expect.stringContaining('color_blue'));
    });
  });
});
