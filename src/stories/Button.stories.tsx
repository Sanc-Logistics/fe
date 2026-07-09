import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { Button } from './Button';

const meta = {
  component: Button,
  tags: ['ai-generated'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Order now',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Order now' })).toHaveTextContent('Order now');
  },
};

export const CssCheck: Story = {
  args: {
    primary: true,
    label: 'Submit',
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /submit/i });
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(85, 90, 185)');
  },
};

export const Secondary: Story = {
  args: {
    label: 'Cancel',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Checkout',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Save',
  },
};
