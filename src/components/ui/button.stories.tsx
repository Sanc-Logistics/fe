import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { Button } from './button';

const meta = {
  component: Button,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: '취소' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '취소' })).toBeVisible();
  },
};

export const Primary: Story = {
  args: { children: '저장', variant: 'default' },
};

export const Outline: Story = {
  args: { children: '시안확인 요청', variant: 'outline' },
};

export const Destructive: Story = {
  args: { children: '주문 취소', variant: 'destructive' },
};

export const Link: Story = {
  args: { children: '상세보기', variant: 'link' },
};
