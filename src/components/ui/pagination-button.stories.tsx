import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { PaginationButton } from './pagination-button';

const meta = {
  component: PaginationButton,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
  args: { onClick: fn() },
} satisfies Meta<typeof PaginationButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: '2' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '2' })).toBeVisible();
  },
};

export const Active: Story = {
  args: { children: '3', active: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');
  },
};

export const Disabled: Story = {
  args: { children: '‹', disabled: true },
};
