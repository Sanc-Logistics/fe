import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { Pagination } from './pagination';

const meta = {
  component: Pagination,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
  args: { onPageChange: fn() },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MiddlePage: Story = {
  args: {
    page: 2,
    totalPages: 5,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  },
};

export const FirstPage: Story = {
  args: {
    page: 1,
    totalPages: 4,
  },
};

export const LastPage: Story = {
  args: {
    page: 4,
    totalPages: 4,
  },
};
