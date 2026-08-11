/**
 * Build fe/public/templates/order-bulk-upload.xlsx from the export template.
 * Run: node scripts/build-order-bulk-upload-template.js
 */
const ExcelJS = require("exceljs");
const path = require("path");

const SRC = path.join(__dirname, "../public/templates/order-master-export.xlsx");
const DEST = path.join(__dirname, "../public/templates/order-bulk-upload.xlsx");
const MASTER = "06_주문마스터_데이터";
const DETAIL = "07_상품상세_데이터";
const GREETING = "08_인사장_데이터";
const LISTS = "_목록";

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(SRC);

  const keep = new Set([MASTER, DETAIL]);
  wb.worksheets
    .filter((s) => !keep.has(s.name))
    .forEach((s) => wb.removeWorksheet(s.id));

  const master = wb.getWorksheet(MASTER);
  const detail = wb.getWorksheet(DETAIL);
  if (!master || !detail) {
    throw new Error("Required sheets missing");
  }

  for (let r = 7; r <= Math.max(master.rowCount, 7); r += 1) {
    master.getRow(r).eachCell({ includeEmpty: true }, (c) => {
      c.value = null;
    });
  }
  for (let r = 5; r <= Math.max(detail.rowCount, 5); r += 1) {
    detail.getRow(r).eachCell({ includeEmpty: true }, (c) => {
      c.value = null;
    });
  }

  // Sample master: 인사장번호 blank (인사장은 선택)
  master.getRow(6).getCell(1).value = null;
  master.getRow(6).getCell(2).value = "접수완료";
  master.getRow(6).getCell(3).value = "택배";
  master.getRow(6).getCell(4).value = "2026-07-31";
  master.getRow(6).getCell(5).value = null;
  master.getRow(6).getCell(6).value = "서대문남";
  master.getRow(6).getCell(7).value = "홍길동";
  master.getRow(6).getCell(8).value = "010-1234-5678";
  master.getRow(6).getCell(9).value = "2026-08-05";
  master.getRow(6).getCell(13).value = "홍길동";
  master.getRow(6).getCell(14).value = "010-1234-5678";
  master.getRow(6).getCell(15).value = "서울시 예시구 예시로 1";
  master.getRow(6).getCell(16).value = null; // 인사장번호 blank
  master.getRow(6).getCell(17).value = null; // 명함유무
  master.getRow(6).getCell(18).value = null; // 자체인사장
  master.getRow(6).getCell(19).value = null; // 특기사항
  master.getRow(6).getCell(20).value = 1;
  master.getRow(6).getCell(21).value = 10;
  master.getRow(6).getCell(25).value = "관리자";
  master.getRow(6).getCell(26).value = "";

  // Hidden list sheet for dropdowns (values may contain commas)
  const listSheet = wb.addWorksheet(LISTS, {
    state: "hidden",
    properties: { tabColor: { argb: "FF94A3B8" } },
  });
  const statusOptions = [
    "접수완료",
    "발송대기",
    "발송중",
    "상품수령",
    "관리자승인",
    "배송상차알림",
    "배송완료",
    "출력완료",
    "취소",
  ];
  const greetingOptions = [
    "",
    "1번",
    "2번",
    "3번",
    "4번",
    "자체",
    "1번, 자체",
    "2번, 자체",
    "3번, 자체",
    "4번, 자체",
  ];
  statusOptions.forEach((v, i) => {
    listSheet.getCell(i + 1, 1).value = v;
  });
  greetingOptions.forEach((v, i) => {
    listSheet.getCell(i + 1, 2).value = v;
  });
  listSheet.getCell(1, 3).value = "8칸";
  listSheet.getCell(2, 3).value = "6칸";
  listSheet.getCell(3, 3).value = "4칸";
  listSheet.getCell(1, 4).value = "동봉";
  listSheet.getCell(2, 4).value = "미동봉";
  listSheet.getCell(1, 5).value = "유";
  listSheet.getCell(2, 5).value = "무";
  const receivePlaces = [
    "공장작업",
    "소사매장",
    "덕소매장",
    "남부매장",
    "방문",
  ];
  receivePlaces.forEach((v, i) => {
    listSheet.getCell(i + 1, 6).value = v;
  });

  for (let r = 6; r <= 105; r += 1) {
    master.getCell(`B${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`${LISTS}!$A$1:$A$${statusOptions.length}`],
      showErrorMessage: true,
      errorTitle: "주문상태",
      error: "목록에서 주문상태를 선택하세요.",
    };
    master.getCell(`P${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`${LISTS}!$B$1:$B$${greetingOptions.length}`],
      showErrorMessage: true,
      errorTitle: "인사장번호",
      error:
        "비움 / 1~4번 / 자체 / '1번, 자체' 형식으로 선택하세요. 1~4번이면 08_인사장_데이터도 작성합니다.",
    };
  }

  detail.getRow(4).getCell(1).value = null;
  detail.getRow(4).getCell(2).value = 1;
  detail.getRow(4).getCell(3).value = "택배";
  detail.getRow(4).getCell(5).value = "명진 1호";
  detail.getRow(4).getCell(6).value = 10;
  detail.getRow(4).getCell(7).value = "개별택배";
  detail.getRow(4).getCell(8).value = null;
  detail.getRow(4).getCell(9).value = {
    formula: 'IF(AND(F4<>"",H4<>""),F4*H4,"")',
  };
  detail.getRow(4).getCell(10).value = "대기";
  detail.getRow(4).getCell(11).value = "샘플";

  // 08_인사장_데이터
  const greeting = wb.addWorksheet(GREETING, {
    properties: { tabColor: { argb: "FF0F766E" } },
  });
  greeting.mergeCells("A1:N1");
  greeting.getCell("A1").value =
    "인사장 데이터 양식 - 주문연계 인사장(1~4번) 1건당 1행. 인사장이미지는 C열 셀에 그림 넣기(붙여넣기 또는 삽입→그림→셀에 그림 넣기). 주문번호는 마스터와 동일 키로 연결";
  greeting.getCell("A1").font = { bold: true, size: 12 };
  greeting.getRow(1).height = 28;

  const greetingHeaders = [
    "주문번호",
    "인사장번호",
    "인사장이미지",
    "자체",
    "인사장내용",
    "수량",
    "크기",
    "제품명",
    "받을곳",
    "특이사항",
    "명함동봉",
    "성명",
    "중앙",
    "연락처",
  ];
  greetingHeaders.forEach((h, i) => {
    const cell = greeting.getRow(3).getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F766E" },
    };
  });
  greeting.getRow(2).getCell(1).value =
    "1~4번이면 이 시트 작성. 인사장이미지: C열을 선택한 뒤 그림 붙여넣기(셀에 그림) 또는 삽입→그림. 업로드 시 서버에 저장됩니다. 자체만이면 이 시트는 비워도 됩니다.";

  greeting.getRow(4).getCell(1).value = null;
  greeting.getRow(4).getCell(2).value = null;
  greeting.getRow(4).getCell(3).value = "(셀에 그림 넣기)";
  greeting.getRow(4).getCell(3).font = {
    color: { argb: "FF94A3B8" },
    italic: true,
  };

  const widths = [16, 12, 16, 8, 28, 8, 8, 18, 12, 18, 10, 10, 10, 14];
  widths.forEach((w, i) => {
    greeting.getColumn(i + 1).width = w;
  });
  for (let r = 4; r <= 53; r += 1) {
    greeting.getRow(r).height = 48;
  }

  for (let r = 4; r <= 103; r += 1) {
    greeting.getCell(`B${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"1,2,3,4"'],
    };
    greeting.getCell(`D${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`${LISTS}!$E$1:$E$2`],
    };
    greeting.getCell(`G${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`${LISTS}!$C$1:$C$3`],
    };
    greeting.getCell(`I${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`${LISTS}!$F$1:$F$${receivePlaces.length}`],
      showErrorMessage: true,
      errorTitle: "받을곳",
      error: "공장작업 / 소사매장 / 덕소매장 / 남부매장 / 방문 중 선택하세요.",
    };
    greeting.getCell(`K${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`${LISTS}!$D$1:$D$2`],
    };
  }

  // 사용안내
  const guide = wb.addWorksheet("00_사용안내", {
    properties: { tabColor: { argb: "FF2F6FED" } },
  });
  guide.getColumn(1).width = 18;
  guide.getColumn(2).width = 80;
  const lines = [
    ["항목", "내용"],
    ["용도", "관리자가 고객 주문을 엑셀로 일괄 등록할 때 사용합니다."],
    [
      "시트",
      "06_주문마스터_데이터 / 07_상품상세_데이터 / 08_인사장_데이터(1~4번 인사장 있을 때)",
    ],
    [
      "회원매칭",
      "연락처(휴대폰)로 회원을 찾습니다. 하이픈 유무는 무시합니다.",
    ],
    [
      "주문번호",
      "마스터·상품상세·인사장 시트에 같은 키로 연결. 비우거나 TEMP-1 이면 ORD-YYYY-XXXXXX 자동 발급.",
    ],
    [
      "인사장번호",
      "비움=인사장 없음. 1번~4번=제품연계 인사장(08시트 필수). 자체=외부인사장. '1번, 자체'처럼 번호+자체 동시 가능.",
    ],
    [
      "08_인사장_데이터",
      "1~4번일 때 작성. 열: 주문번호, 인사장번호, 인사장이미지(행에 그림 삽입→서버 저장), 자체, 인사장내용, 수량, 크기, 제품명, 받을곳(공장작업/소사매장/덕소매장/남부매장/방문), 특이사항, 명함동봉, 성명, 중앙, 연락처.",
    ],
    ["주문상태", "기본 접수완료. 업로드 후 보기→관리자 승인 시 발송대기."],
    ["주문구분", "택배 | 배달 | 배달/택배"],
    ["참고", "헤더행(✓ 표시)은 변경하지 마세요."],
  ];
  lines.forEach((pair, i) => {
    const row = guide.getRow(i + 1);
    row.getCell(1).value = pair[0];
    row.getCell(2).value = pair[1];
    if (i === 0) {
      row.font = { bold: true };
    }
  });

  wb.views = [{ activeTab: 0 }];
  await wb.xlsx.writeFile(DEST);
  console.log("Wrote", DEST);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
