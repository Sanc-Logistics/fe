import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fn } from 'storybook/test';

import { Toast, ToastViewport } from './toast';

const meta = {
  component: Toast,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
  args: { onClose: fn() },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: 'success',
    title: '저장 완료',
    message: '주문 정보가 정상적으로 저장되었습니다.',
    className: 'max-w-sm',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('주문 정보가 정상적으로 저장되었습니다.');
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: '처리 실패',
    message: '주문 확정 중 오류가 발생했습니다. 다시 시도해 주세요.',
    className: 'max-w-sm',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeVisible();
  },
};

export const Warn: Story = {
  args: {
    variant: 'warn',
    message: '기쁨1호, 특선1호는 세로형으로 제작됩니다. 해당 제품이면 제품명을 꼭 적어주세요.',
    className: 'max-w-sm',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    title: '안내',
    message: '시안 확인 후 제작이 시작됩니다.',
    className: 'max-w-sm',
  },
};

export const WithClose: Story = {
  args: {
    variant: 'info',
    message: '닫기 버튼으로 알림을 숨길 수 있습니다.',
    className: 'max-w-sm',
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '알림 닫기' }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const Viewport: Story = {
  args: { message: '' },
  render: () => (
    <ToastViewport>
      <Toast variant="success" title="업로드 완료" message="엑셀 파일이 등록되었습니다." />
      <Toast variant="warn" message="미입력 항목이 있습니다. 확인 후 저장하세요." />
      <Toast variant="error" title="오류" message="네트워크 연결을 확인해 주세요." onClose={fn()} />
    </ToastViewport>
  ),
  parameters: { layout: 'fullscreen' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('엑셀 파일이 등록되었습니다.')).toBeVisible();
    await expect(canvas.getByText('네트워크 연결을 확인해 주세요.')).toBeVisible();
  },
};
