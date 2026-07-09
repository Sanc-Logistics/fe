import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { Checkbox } from './checkbox';

const meta = {
  component: Checkbox,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
  args: { onChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {
    label: '약관에 동의합니다',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: '약관에 동의합니다' })).not.toBeChecked();
  },
};

export const Checked: Story = {
  args: {
    label: '알림 수신',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: '필수 항목',
    disabled: true,
  },
};
