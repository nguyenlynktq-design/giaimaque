import React from 'react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-sky-400/50 rounded-2xl p-5 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-amber-400 flex items-center space-x-2">
            <span>🧭</span>
            <span>HƯỚNG DẪN HẢI TRÌNH GIẢI MÃ</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="py-3 text-xs sm:text-sm space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
          <p className="font-semibold text-cyan-300">
            Chào mừng thầy cô và các em học sinh bước vào hải trình khám phá kiệt tác "Quê hương" (Tế Hanh):
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>4 Đội thi đua:</strong> Giáo viên nhấp vào đội chuẩn bị trả lời tại bảng bên trái. Điểm sẽ tự động ghi nhận cho đội đó khi vượt qua thử thách.
            </li>
            <li>
              <strong>Quy tắc tính điểm:</strong> Trả lời đúng nhận ngay{' '}
              <span className="text-emerald-400 font-bold">+10 điểm</span>. Giáo viên có thể bấm{' '}
              <span className="text-amber-400 font-bold">"Giải thích sâu"</span> để đặt câu hỏi trích dẫn văn bản và cộng thêm tối đa{' '}
              <span className="text-amber-400 font-bold">+5 điểm thưởng</span>. Trả lời sai không trừ điểm.
            </li>
            <li>
              <strong>6 Chặng mở khóa tuần tự:</strong> Phải hoàn thành đúng thử thách ở chặng hiện tại mới có thể vượt sóng sang chặng kế tiếp.
            </li>
            <li>
              <strong>Trạm phản biện AI (Năng lực số):</strong> Rèn luyện tư duy độc lập khi đánh giá nhận định văn học máy móc do AI đưa ra.
            </li>
            <li>
              <strong>Âm thanh chuẩn Giọng Nam Miền Bắc:</strong> Hệ thống AI phát âm tiếng Việt chuẩn xác từng thanh điệu, ngữ điệu truyền cảm, hỗ trợ đọc đề bài, đọc thơ và bài học sư phạm.
            </li>
            <li>
              <strong>6 Mảnh hồn làng:</strong> Mỗi chặng hoàn thành sẽ thắp sáng một mảnh trên cánh buồm bên phải, hướng tới đại kết cục với thông điệp cao đẹp: <em>Tình yêu quê hương đất nước</em>.
            </li>
          </ul>
        </div>

        <div className="pt-3 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 cursor-pointer transition transform active:scale-95"
          >
            Đã hiểu, sẵn sàng ra khơi! ⛵
          </button>
        </div>
      </div>
    </div>
  );
};
