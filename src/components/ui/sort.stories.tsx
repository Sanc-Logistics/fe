import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { Sort } from './sort';

const meta = {
  component: Sort,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
  args: { onClick: fn() },
} satisfies Meta<typeof Sort>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unsorted: Story = {
  args: { label: '주문일자' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /주문일자/ })).toHaveAttribute('aria-sort', 'none');
  },
};

export const Ascending: Story = {
  args: { label: '성명', direction: 'asc' },
};

export const Descending: Story = {
  args: { label: '수량', direction: 'desc' },
};
