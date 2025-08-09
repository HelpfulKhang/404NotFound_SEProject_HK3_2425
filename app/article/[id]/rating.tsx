import { useState } from "react";

export default function RatingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {/* Phần Đánh giá */}
      <div className="border border-blue-500 p-4 rounded-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">★ ★ ★ ★ ☆</span>
          <span className="font-medium">4.2</span>
          <span className="text-gray-500">• 1247 đánh giá</span>
        </div>
        <div
          className="flex flex-col items-center text-gray-500 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <span>Đánh giá bài viết này</span>
          <span>☆ ☆ ☆ ☆ ☆</span>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-2">
              Amazon chi 100 tỷ USD để nắm cơ hội "ngàn năm có một" trong AI
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-500">★ ★ ★ ★ ☆</span>
              <span className="font-medium">4.2</span>
              <span className="text-gray-500">• 1247 đánh giá</span>
            </div>

            <h3 className="font-medium mb-1">Đánh giá bài viết này</h3>
            <div className="text-2xl mb-4">☆ ☆ ☆ ☆ ☆</div>

            <h3 className="font-medium mb-2">Đánh giá chi tiết (tùy chọn)</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Chất lượng hình ảnh</span>
                <span>☆ ☆ ☆ ☆ ☆</span>
              </div>
              <div className="flex justify-between">
                <span>Chất lượng nội dung</span>
                <span>☆ ☆ ☆ ☆ ☆</span>
              </div>
              <div className="flex justify-between">
                <span>Độ chính xác</span>
                <span>☆ ☆ ☆ ☆ ☆</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" id="anonymous" />
              <label htmlFor="anonymous">Đánh giá ẩn danh</label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Hủy
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
