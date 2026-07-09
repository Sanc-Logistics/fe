import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Button } from './button';
import { Card } from './card';
import { Chip } from './chip';

const meta = {
  component: Card,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Elevated: Story = {
  args: {
    title: '주문 요약',
    description: '최근 접수된 주문 현황입니다.',
    className: 'w-full max-w-md',
    children: (
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted">주문번호</span>
          <span className="font-medium text-ink">ORD-1001</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">상태</span>
          <Chip variant="blue">제작중</Chip>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="primary">
            상세보기
          </Button>
          <Button size="sm">목록</Button>
        </div>
      </div>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '주문 요약' })).toBeVisible();
  },
};

export const Panel: Story = {
  args: {
    variant: 'panel',
    className: 'w-full max-w-sm',
    children: (
      <div>
        <h4 className="mb-2 text-base font-semibold text-ink">명진 1호</h4>
        <div className="flex justify-between text-xs text-muted">
          <span>수량</span>
          <b className="text-ink">300</b>
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>납기</span>
          <b className="text-ink">2026-01-16</b>
        </div>
      </div>
    ),
  },
};

export const Simple: Story = {
  args: {
    className: 'w-full max-w-xs',
    children: <p className="text-sm text-muted">카드 본문만 있는 간단한 레이아웃입니다.</p>,
  },
};
