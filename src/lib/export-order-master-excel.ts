import ExcelJS from "exceljs";

const TEMPLATE_URL = "/templates/order-master-export.xlsx";
const MASTER_SHEET = "06_주문마스터_데이터";
const DETAIL_SHEET = "07_상품상세_데이터";
const MASTER_DATA_START_ROW = 6;
const DETAIL_DATA_START_ROW = 4;

export type OrderMasterExportValues = Array<string | number | Date | null>;
export type OrderDetailExportValues = Array<string | number | Date | null>;

type CellStyleSnapshot = {
  style: Partial<ExcelJS.Style>;
  numFmt?: string;
};

function snapshotRowStyles(row: ExcelJS.Row, columnCount: number): CellStyleSnapshot[] {
  const styles: CellStyleSnapshot[] = [];
  for (let col = 1; col <= columnCount; col += 1) {
    const cell = row.getCell(col);
    styles.push({
      style: { ...cell.style },
      numFmt: cell.numFmt,
    });
  }
  return styles;
}

function applyCellStyle(cell: ExcelJS.Cell, snapshot: CellStyleSnapshot) {
  cell.style = { ...snapshot.style };
  if (snapshot.numFmt) {
    cell.numFmt = snapshot.numFmt;
  }
}

function clearFromRow(sheet: ExcelJS.Worksheet, startRow: number) {
  const lastRow = Math.max(sheet.rowCount, startRow);
  for (let rowNumber = startRow; rowNumber <= lastRow; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.value = null;
    });
  }
}

function writeStyledRow({
  sheet,
  rowNumber,
  values,
  styles,
  rowHeight,
}: {
  sheet: ExcelJS.Worksheet;
  rowNumber: number;
  values: ExcelJS.CellValue[];
  styles: CellStyleSnapshot[];
  rowHeight?: number;
}) {
  const row = sheet.getRow(rowNumber);
  if (rowHeight) {
    row.height = rowHeight;
  }
  values.forEach((value, index) => {
    const col = index + 1;
    const cell = row.getCell(col);
    const style = styles[index];
    if (style) {
      applyCellStyle(cell, style);
    }
    cell.value = value;
  });
  row.commit();
}

/**
 * Export all 주문마스터 / 상품상세 rows into the attached Excel template design
 * (keeps title/header styling; replaces sample data rows).
 */
export async function exportOrderMasterWorkbook({
  masters,
  details,
  filename,
}: {
  masters: OrderMasterExportValues[];
  details: OrderDetailExportValues[];
  filename: string;
}) {
  const response = await fetch(TEMPLATE_URL);
  if (!response.ok) {
    throw new Error("엑셀 양식 파일을 불러오지 못했습니다.");
  }

  const templateBuffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);

  const masterSheet = workbook.getWorksheet(MASTER_SHEET);
  const detailSheet = workbook.getWorksheet(DETAIL_SHEET);
  if (!masterSheet || !detailSheet) {
    throw new Error("엑셀 양식 시트를 찾을 수 없습니다.");
  }

  // Keep only 주문마스터 / 상품상세 sheets in the exported file.
  const keepSheets = new Set([MASTER_SHEET, DETAIL_SHEET]);
  workbook.worksheets
    .filter((sheet) => !keepSheets.has(sheet.name))
    .forEach((sheet) => {
      workbook.removeWorksheet(sheet.id);
    });

  const masterStyleRow = masterSheet.getRow(MASTER_DATA_START_ROW);
  const detailStyleRow = detailSheet.getRow(DETAIL_DATA_START_ROW);
  const masterStyles = snapshotRowStyles(masterStyleRow, 26);
  const detailStyles = snapshotRowStyles(detailStyleRow, 11);
  const masterRowHeight = masterStyleRow.height;
  const detailRowHeight = detailStyleRow.height;

  clearFromRow(masterSheet, MASTER_DATA_START_ROW);
  clearFromRow(detailSheet, DETAIL_DATA_START_ROW);

  masters.forEach((values, index) => {
    writeStyledRow({
      sheet: masterSheet,
      rowNumber: MASTER_DATA_START_ROW + index,
      values: values.map((value) => (value === "" ? null : value)),
      styles: masterStyles,
      rowHeight: masterRowHeight,
    });
  });

  details.forEach((values, index) => {
    const rowNumber = DETAIL_DATA_START_ROW + index;
    const cells: ExcelJS.CellValue[] = values.map((value) =>
      value === "" ? null : value,
    );
    // Column I (금액): preserve template formula
    cells[8] = {
      formula: `IF(AND(F${rowNumber}<>"",H${rowNumber}<>""),F${rowNumber}*H${rowNumber},"")`,
    };

    writeStyledRow({
      sheet: detailSheet,
      rowNumber,
      values: cells,
      styles: detailStyles,
      rowHeight: detailRowHeight,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
