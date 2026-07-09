import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { LoginForm } from './login-form';

const meta = {
  component: LoginForm,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
  args: { onSubmit: fn() },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '로그인' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '로그인' })).toBeVisible();
  },
};

export const Submit: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('이메일'), 'user@sanc.kr');
    await userEvent.type(canvas.getByLabelText('비밀번호'), 'secret123');
    await userEvent.click(canvas.getByRole('button', { name: '로그인' }));
  },
};
