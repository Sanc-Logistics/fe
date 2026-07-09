import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { Header } from './Header';

const meta = {
  component: Header,
  tags: ['ai-generated'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onLogin: fn(),
    onLogout: fn(),
    onCreateAccount: fn(),
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    user: {
      name: 'Jane Doe',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Jane Doe')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /log out/i })).toBeVisible();
  },
};

export const LoggedOut: Story = {};
