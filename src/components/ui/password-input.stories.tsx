import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { PasswordInput } from './password-input';

const meta = {
  component: PasswordInput,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '비밀번호',
    placeholder: '••••••••',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('비밀번호')).toHaveAttribute('type', 'password');
  },
};

export const WithError: Story = {
  args: {
    label: '비밀번호 확인',
    error: '비밀번호가 일치하지 않습니다.',
  },
};

export const ToggleVisibility: Story = {
  args: {
    label: '비밀번호',
    defaultValue: 'secret123',
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '보기' }));
    await expect(canvas.getByLabelText('비밀번호')).toHaveAttribute('type', 'text');
  },
};
