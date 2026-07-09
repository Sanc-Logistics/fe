import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Chip } from './chip';
import { Sort } from './sort';
import { Table, type TableColumn } from './table';

type OrderRow = {
  orderNo: string;
  name: string;
  product: string;
  status: string;
  qty: string;
};

const meta = {
  component: Table<OrderRow>,
  tags: ['ai-generated'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Table<OrderRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRows: OrderRow[] = [
  { orderNo: 'ORD-1001', name: '이순희', product: '명진 1호', status: '제작중', qty: '300' },
  { orderNo: 'ORD-1002', name: '홍길동', product: '인사장 A', status: '시안확인', qty: '120' },
  { orderNo: 'ORD-1003', name: '김영희', product: '엽서 세트', status: '제작완료', qty: '80' },
];

const columns: TableColumn<OrderRow>[] = [
  { key: 'orderNo', header: '주문번호' },
  { key: 'name', header: <Sort label="성명" direction="asc" /> },
  { key: 'product', header: '제품명' },
  {
    key: 'status',
    header: '상태',
    render: (row: OrderRow) => {
      const variant =
        row.status === '제작완료' ? 'green' : row.status === '시안확인' ? 'yellow' : ('blue' as const);
      return <Chip variant={variant}>{row.status}</Chip>;
    },
  },
  { key: 'qty', header: '수량', className: 'text-right' },
];

export const WithData: Story = {
  args: {
    caption: '주문 목록',
    columns,
    data: sampleRows,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('ORD-1001')).toBeVisible();
    await expect(canvas.getByText('제작완료')).toBeVisible();
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: '등록된 주문이 없습니다.',
  },
};
