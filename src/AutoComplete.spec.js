import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import '@testing-library/user-event';
import React from 'react';
import AutoComplete from './AutoComplete';

const data = ['Pizza', 'Tacos', 'Burgers'];

describe('AutoComplete', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('should render the base element', () => {
    const { container } = render(<AutoComplete />);
    const ele = container.querySelector('label');

    expect(ele).toBeInTheDocument();
  });

  it('should render a label when `label` is specified', () => {
    render(<AutoComplete label="Foo" />);

    const ele = screen.queryByLabelText('Foo');

    expect(ele).toBeInTheDocument();
  });

  describe('Menu Generation', () => {
    let container;

    beforeEach(async () => {
      container = render(<AutoComplete data={data} />);
      await user.keyboard('a');
    });

    it('should render a menu when there is matching data', () => {
      expect(screen.queryByRole('list')).toBeInTheDocument();
    });

    it('should render corresponding buttons', () => {
      expect(screen.queryAllByRole('button')).toHaveLength(2);
      expect(screen.queryByText('Tacos')).toBeInTheDocument();
      expect(screen.queryByText('Pizza')).toBeInTheDocument();
    });

    it('should filter based on input', async () => {
      await user.keyboard('c');

      expect(screen.queryAllByRole('button')).toHaveLength(1);
      expect(screen.queryByText('Tacos')).toBeInTheDocument();
    });

    it('should traverse with the keyboard', async () => {
      await user.keyboard('{ArrowDown}');
      expect(screen.queryByText('Pizza')).toHaveFocus();
    });

    it('should focus back on the input when arrowing past the final menu option', async () => {
      await user.keyboard('c');
      await user.keyboard('{ArrowDown}{ArrowDown}');

      expect(screen.queryByRole('textbox')).toHaveFocus();
    });

    it('should focus back on the input when arrowing above the top menu option', async () => {
      await user.keyboard('c');
      await user.keyboard('{ArrowUp}{ArrowUp}');

      expect(screen.queryByRole('textbox')).toHaveFocus();
    });

    it('should fill the text input with selected button value', async () => {
      await user.keyboard('{ArrowDown}{Enter}');

      const input = screen.queryByRole('textbox');

      expect(input).toHaveValue('Pizza');
      expect(screen.queryByRole('list')).toBeNull();
    });

    it('should fill the text input with clicked button value', async () => {
      const button = screen.queryAllByRole('button')[0];

      await user.pointer({ target: button, offset: 0, keys: '[MouseLeft]' });

      const input = screen.queryByRole('textbox');

      expect(input).toHaveValue('Pizza');
      expect(screen.queryByRole('list')).toBeNull();
    });
  });

  describe('Callbacks', () => {
    it('should call a provided callback on value change', async () => {
      const callback = jest.fn();

      render(<AutoComplete data={data} changeCallback={callback} />);

      await user.keyboard('a');

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('CSS Overrides', () => {
    let container;
    const map = [
      ['componentClassName', 'component'],
      ['menuClassName', 'menu'],
      ['buttonClassName', 'button'],
      ['inputClassName', 'input'],
    ];

    beforeEach(() => {
      ({ container } = render(
        <AutoComplete
          componentClassName="component"
          menuClassName="menu"
          buttonClassName="button"
          inputClassName="input"
          data={data}
        />
      ));
    });

    it.each(map)('defines %s with class "%s"', async (className, result) => {
      await user.keyboard('a');

      const element = container.querySelector(`.${result}`);

      expect(element).not.toBeNull();
    });
  });
});
