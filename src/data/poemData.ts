import { Team, Fragment } from '../types';

export const FULL_POEM = [
  {
    stanza: 1,
    title: 'Khổ 1: Vị trí và nghề nghiệp làng chài',
    lines: [
      'Chim bay mỏi cánh biển khơi',
      'Làng tôi ở vốn làm nghề chài lưới:',
      'Nước bao vây, cách biển nửa ngày sông.',
    ],
  },
  {
    stanza: 2,
    title: 'Khổ 2: Cảnh đoàn thuyền ra khơi đánh cá',
    lines: [
      'Khi trời trong, gió nhẹ, sớm mai hồng,',
      'Dân trai tráng bơi thuyền đi đánh cá.',
      'Chiếc thuyền nhẹ hăng như con tuấn mã,',
      'Phăng mái chèo, mạnh mẽ vượt trường giang.',
      'Cánh buồm giương to như mảnh hồn làng,',
      'Rướn thân trắng bao la thâu góp gió...',
    ],
  },
  {
    stanza: 3,
    title: 'Khổ 3: Cảnh đoàn thuyền cá trở về bến',
    lines: [
      'Ngày hôm sau ồn ào trên bến đỗ,',
      'Cả dân làng tấp nập đón ghe về.',
      '“Nhờ ơn trời biển lặng với cá đầy”,',
      'Những con cá tươi ngon thân bạc trắng.',
      'Dân chài lưới làn da ngăm rám nắng,',
      'Cả thân hình nồng thở vị xa xăm;',
      'Chiếc thuyền im bến mỏi trở về nằm,',
      'Nghe chất muối thấm dần trong thớ vỏ.',
    ],
  },
  {
    stanza: 4,
    title: 'Khổ 4: Nỗi nhớ làng chài da diết',
    lines: [
      'Nay xa cách lòng tôi luôn tưởng nhớ,',
      'Màu nước xanh, cá bạc, chiếc buồm vôi,',
      'Thoáng con thuyền rẽ sóng chạy ra khơi,',
      'Tôi thấy nhớ cái mùi nồng mặn quá!',
    ],
  },
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 1,
    name: 'ĐỘI 1: HẢI ÂU',
    slogan: 'Tiên phong vượt sóng',
    icon: '🚣‍♂️',
    score: 0,
    color: 'from-blue-900 to-slate-900 border-blue-500/50 text-cyan-200',
  },
  {
    id: 2,
    name: 'ĐỘI 2: CÁ HEO',
    slogan: 'Năng động vươn xa',
    icon: '🐬',
    score: 0,
    color: 'from-emerald-950 to-slate-900 border-emerald-500/50 text-emerald-200',
  },
  {
    id: 3,
    name: 'ĐỘI 3: KÌNH NGƯ',
    slogan: 'Kiên cường bền bỉ',
    icon: '⛵',
    score: 0,
    color: 'from-amber-950 to-slate-900 border-amber-500/50 text-amber-200',
  },
  {
    id: 4,
    name: 'ĐỘI 4: TRIỀU DÂNG',
    slogan: 'Sức mạnh đoàn kết',
    icon: '🌊',
    score: 0,
    color: 'from-purple-950 to-slate-900 border-purple-500/50 text-purple-200',
  },
];

export const FRAGMENTS: Fragment[] = [
  {
    id: 1,
    name: 'NƠI CHỐN',
    verse: 'Làng tôi ở vốn làm nghề chài lưới / Nước bao vây, cách biển nửa ngày sông',
    message:
      'Quê hương bắt đầu từ những điều rất gần gũi. Hãy học cách quan sát thật kĩ để nhận ra vẻ đẹp mộc mạc của nơi mình thuộc về.',
  },
  {
    id: 2,
    name: 'SỨC SỐNG',
    verse: 'Chiếc thuyền nhẹ hăng như con tuấn mã / Phăng mái chèo, mạnh mẽ vượt trường giang',
    message:
      'Khi có mục tiêu và ý chí quyết tâm, mỗi chúng ta cũng có thể "phăng mái chèo" để vượt qua những con sóng thử thách của riêng mình.',
  },
  {
    id: 3,
    name: 'BIỂU TƯỢNG',
    verse: 'Cánh buồm giương to như mảnh hồn làng / Rướn thân trắng bao la thâu góp gió',
    message:
      'Có những điều bình dị nhưng chứa cả một phần tâm hồn. Hãy biết trân trọng những biểu tượng thiêng liêng đã nuôi dưỡng tâm hồn quê hương.',
  },
  {
    id: 4,
    name: 'LAO ĐỘNG',
    verse: 'Ngày hôm sau ồn ào trên bến đỗ / Cả dân làng tấp nập đón ghe về',
    message:
      'Mỗi thành quả ngọt ngào đều được tạo nên từ giọt mồ hôi lao động và tinh thần sẻ chia. Hãy biết ơn công sức của những người lao động xung quanh ta.',
  },
  {
    id: 5,
    name: 'GẮN BÓ',
    verse: 'Dân chài lưới làn da ngăm rám nắng... Nghe chất muối thấm dần trong thớ vỏ',
    message:
      'Khi ta gắn bó đủ sâu với một miền quê, nơi ấy không chỉ tồn tại ở không gian bên ngoài mà đã hòa vào máu thịt, tâm hồn của chính ta.',
  },
  {
    id: 6,
    name: 'NỖI NHỚ',
    verse: 'Nay xa cách lòng tôi luôn tưởng nhớ... Tôi thấy nhớ cái mùi nồng mặn quá!',
    message:
      'Có những giá trị bình dị ta chỉ thấm thía khi đi xa. Hãy yêu quê hương từ hôm nay bằng những hành động nhỏ bé và chân thành nhất.',
  },
];

export const DEEP_QUESTIONS: Record<string | number, string> = {
  1: 'Chi tiết nào trong hai câu đầu xác định rõ vị trí địa lý của làng chài? Tại sao cách giới thiệu mộc mạc này lại tạo cảm giác thân thương, chân thật?',
  2: 'Nếu thay các từ "rướn", "phăng" bằng từ thông thường như "chèo", "đi" thì vẻ đẹp hào hùng, dũng mãnh của con thuyền và người dân chài sẽ suy giảm ra sao?',
  3: 'Vì sao tác giả lại ví cánh buồm với "mảnh hồn làng" - biến một vật thể hữu hình thành biểu tượng tinh thần vô hình, thiêng liêng?',
  ai: 'Tại sao con người cần phải đọc trực tiếp văn bản, suy ngẫm độc lập và cảm nhận bằng trái tim thay vì tin tưởng tuyệt đối vào lời giải của trí tuệ nhân tạo (AI)?',
  4: 'Tiếng reo vui "cá đầy ghe" và không khí náo nức trên bến đỗ thể hiện niềm hạnh phúc gì của người dân sau chuyến ra khơi gian lao?',
  5: 'Phân tích vẻ đẹp nghệ thuật độc đáo của câu thơ "Nghe chất muối thấm dần trong thớ vỏ"? Tại sao nói con thuyền như một cơ thể sống biết cảm nhận?',
  6: 'Vì sao nỗi nhớ quê hương ở câu thơ kết lại đọng lại ở một "mùi vị" - "cái mùi nồng mặn"? Cảm giác ấy tác động thế nào đến tâm thức người con xa quê?',
};
