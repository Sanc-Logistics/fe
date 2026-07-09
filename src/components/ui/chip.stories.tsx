import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Chip } from './chip';

const meta = {
  component: Chip,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blue: Story = {
  args: { children: '접수', variant: 'blue' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('접수')).toBeVisible();
  },
};

export const Green: Story = {
  args: { children: '제작완료', variant: 'green' },
};

export const Yellow: Story = {
  args: { children: '시안확인', variant: 'yellow' },
};

export const Red: Story = {
  args: { children: '이슈발생', variant: 'red' },
};

export const Purple: Story = {
  args: { children: '배송중', variant: 'purple' },
};
