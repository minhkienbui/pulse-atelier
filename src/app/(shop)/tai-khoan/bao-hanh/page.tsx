"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  ChevronLeft,
  ShieldCheck,
  Upload,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Mock owned watches to select from
const OWNED_WATCHES = [
  { id: "w-1", name: "Rolex Submariner Date 41mm", serialNumber: "RLX-9823-A81" },
  { id: "w-2", name: "Cartier Santos de Cartier Medium", serialNumber: "CTR-8871-S22" },
];

export default function WarrantyRequestPage() {
  const router = useRouter();

  // Form states
  const [selectedWatchId, setSelectedWatchId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [serviceType, setServiceType] = useState("Bảo hành định kỳ (Lau dầu, căn chỉnh)");
  const [issue, setIssue] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleWatchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedWatchId(id);
    const watch = OWNED_WATCHES.find((w) => w.id === id);
    if (watch) {
      setSerialNumber(watch.serialNumber);
    } else {
      setSerialNumber("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWatchId || !issue) {
      toast.error("Vui lòng nhập đầy đủ thông tin yêu cầu bảo hành!");
      return;
    }

    setIsSubmitting(true);

    // Simulate server request
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Gửi yêu cầu bảo hành thành công! Nhân viên điều phối sẽ liên hệ để nhận máy.");
      router.push("/tai-khoan");
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-6">
        <Link
          href="/tai-khoan"
          className="inline-flex items-center gap-2 text-xs text-ivory/40 hover:text-gold transition-colors mb-6 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Quay lại tài khoản
        </Link>

        <h1 className="heading-serif text-3xl text-ivory mb-2">Tạo Yêu Cầu Bảo Hành</h1>
        <p className="text-sm text-ivory/40 mb-8">
          Điền thông tin chi tiết về sản phẩm và vấn đề gặp phải để bộ phận kỹ thuật hỗ trợ nhanh nhất.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Main Form - Left */}
          <form onSubmit={handleSubmit} className="md:col-span-8 glass-dark p-6 sm:p-8 rounded-2xl border border-dark-border/30 space-y-6">
            <h2 className="text-base font-semibold text-ivory/90 flex items-center gap-2 pb-4 border-b border-dark-border/10">
              <Wrench size={18} className="text-gold" />
              Chi Tiết Yêu Cầu
            </h2>

            {/* Select Watch */}
            <div className="space-y-1.5">
              <label className="text-xs text-ivory/40 font-medium">Chọn đồng hồ của bạn *</label>
              <select
                required
                value={selectedWatchId}
                onChange={handleWatchSelect}
                className="w-full px-4 py-3 bg-dark-bg/60 border border-dark-border rounded-lg text-sm text-ivory focus:border-gold/40 transition-colors cursor-pointer"
              >
                <option value="" className="bg-dark-card text-ivory/40">-- Chọn sản phẩm đã mua --</option>
                {OWNED_WATCHES.map((w) => (
                  <option key={w.id} value={w.id} className="bg-dark-card text-ivory">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Serial Number */}
            <div className="space-y-1.5">
              <label className="text-xs text-ivory/40 font-medium">Số Serial (Tự động điền)</label>
              <input
                type="text"
                disabled
                value={serialNumber}
                placeholder="Chọn sản phẩm để tự động điền số Serial"
                className="w-full px-4 py-3 bg-dark-bg/20 border border-transparent rounded-lg text-sm text-ivory/40 font-mono cursor-not-allowed"
              />
            </div>

            {/* Service Type */}
            <div className="space-y-1.5">
              <label className="text-xs text-ivory/40 font-medium">Loại hình dịch vụ *</label>
              <select
                required
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-3 bg-dark-bg/60 border border-dark-border rounded-lg text-sm text-ivory focus:border-gold/40 transition-colors cursor-pointer"
              >
                <option value="Bảo hành định kỳ (Lau dầu, căn chỉnh)" className="bg-dark-card">Bảo hành định kỳ (Lau dầu, căn chỉnh)</option>
                <option value="Sửa chữa hư hỏng" className="bg-dark-card">Sửa chữa hư hỏng</option>
                <option value="Thay linh kiện" className="bg-dark-card">Thay linh kiện</option>
                <option value="Yêu cầu kiểm định đồng hồ" className="bg-dark-card">Yêu cầu kiểm định đồng hồ</option>
                <option value="Khác" className="bg-dark-card">Khác</option>
              </select>
            </div>

            {/* Issue Description */}
            <div className="space-y-1.5">
              <label className="text-xs text-ivory/40 font-medium">Mô tả tình trạng/vấn đề *</label>
              <textarea
                required
                rows={5}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Mô tả cụ thể biểu hiện của đồng hồ (ví dụ: Chạy chậm 15 giây/ngày, va đập làm trầy xước vỏ, lỏng núm vặn, hết pin...)"
                className="w-full px-4 py-3 bg-dark-bg/60 border border-dark-border rounded-lg text-sm text-ivory focus:border-gold/40 transition-colors resize-none"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <label className="text-xs text-ivory/40 font-medium">Hình ảnh đính kèm (Tùy chọn)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="border border-dashed border-dark-border hover:border-gold/30 rounded-xl p-6 text-center cursor-pointer transition-colors bg-dark-card/20 block"
              >
                <Upload size={24} className="text-ivory/30 mx-auto mb-2" />
                <span className="block text-xs text-ivory/50 font-semibold mb-1">Kéo thả hoặc bấm để chọn ảnh</span>
                <span className="block text-[10px] text-ivory/25">Chấp nhận JPG, PNG dung lượng dưới 5MB</span>
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {images.map((img, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-dark-card border border-dark-border/50 text-xs text-ivory/70">
                      <span className="truncate max-w-[120px]">{img.name}</span>
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-300 font-semibold px-1"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full py-4 text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang Gửi Yêu Cầu...
                </>
              ) : (
                <>
                  Gửi Yêu Cầu Bảo Hành
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Guidelines Sidebar - Right */}
          <aside className="md:col-span-4 space-y-4">
            <div className="glass-dark p-5 rounded-2xl border border-dark-border/30 space-y-4 text-xs text-ivory/50 leading-relaxed">
              <h3 className="text-sm font-semibold text-ivory/90 flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold" />
                Chính Sách Bảo Hành
              </h3>
              <p>
                🔒 <strong>100% Bảo hiểm vận chuyển:</strong> Tempus chịu hoàn toàn trách nhiệm và chi phí bảo hiểm trong quá trình vận chuyển đồng hồ của bạn đến xưởng kỹ thuật.
              </p>
              <p>
                🛠️ <strong>Kỹ thuật viên chứng chỉ hãng:</strong> Tất cả quy trình lau dầu, sửa chữa được thực hiện bởi nghệ nhân có bằng cấp chuyên môn của Rolex, Omega hoặc AP.
              </p>
              <p>
                ⏱️ <strong>Kiểm thử 72 giờ:</strong> Sau khi bảo dưỡng, đồng hồ sẽ được đưa vào máy kiểm tra giả lập chuyển động cổ tay liên tục trong 72 giờ để bảo đảm độ chính xác tối ưu trước khi bàn giao.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.02] space-y-3 text-xs text-yellow-500/60 leading-relaxed flex items-start gap-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong className="text-yellow-500/80 block mb-1">Lưu ý quan trọng:</strong>
                Vui lòng không gửi kèm hộp sổ hoặc phụ kiện không liên quan trừ khi có yêu cầu đặc biệt từ kỹ thuật viên để tránh thất lạc.
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
