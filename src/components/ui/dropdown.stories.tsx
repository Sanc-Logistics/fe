import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { Dropdown } from './dropdown';

const meta = {
  component: Dropdown,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
  args: { onChange: fn() },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const orderTypeOptions = [
  { value: 'delivery', label: '택배' },
  { value: 'pickup', label: '배달' },
];

export const Default: Story = {
  args: {
    label: '주문구분',
    options: orderTypeOptions,
    defaultValue: 'delivery',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('주문구분')).toHaveValue('delivery');
  },
};

export const ProductionStatus: Story = {
  args: {
    label: '제작상태',
    options: [
      { value: 'draft', label: '시안확인' },
      { value: 'progress', label: '제작중' },
      { value: 'done', label: '제작완료' },
      { value: 'issue', label: '이슈발생' },
    ],
    defaultValue: 'progress',
  },
};
