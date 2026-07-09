import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Input } from './input';

const meta = {
  component: Input,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '성명',
    defaultValue: '이순희',
    placeholder: '이름을 입력하세요',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('성명')).toHaveValue('이순희');
  },
};

export const WithError: Story = {
  args: {
    label: '연락처',
    defaultValue: '010-123',
    error: '올바른 연락처를 입력하세요.',
  },
};

export const Disabled: Story = {
  args: {
    label: '주문일자',
    defaultValue: '2026-01-10',
    disabled: true,
  },
};
