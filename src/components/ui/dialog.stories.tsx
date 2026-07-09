import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { Dialog } from './dialog';

const meta = {
  component: Dialog,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  args: { onClose: fn() },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    title: '주문 확인',
    children: <p className="text-sm text-muted">선택한 주문을 확정하시겠습니까?</p>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('dialog', { name: '주문 확인' })).toBeVisible();
  },
};

export const Closed: Story = {
  args: {
    open: false,
    title: '주문 확인',
    children: null,
  },
};
