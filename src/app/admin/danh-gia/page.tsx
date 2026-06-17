"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Check, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Mock reviews database
const INITIAL_REVIEWS = [
  {
    id: "REV-101",
    user: "Trần Minh Hoàng",
    watch: "Rolex Submariner Date 41mm",
    rating: 5,
    comment: "Đồng hồ quá đẹp, lên tay cực kỳ sang trọng. Nhân viên hỗ trợ nhiệt tình, tư vấn chi tiết chính sách bảo hành.",
    isApproved: false,
    createdAt: "2026-06-03",
  },
  {
    id: "REV-102",
    user: "Lê Ngọc Diệp",
    watch: "Cartier Santos de Cartier Medium",
    rating: 5,
    comment: "Đồng hồ chính hãng, hộp sổ thẻ đầy đủ. Thiết kế Santos lật mặt cực kỳ tinh xảo. Rất hài lòng với Tempus.",
    isApproved: true,
    createdAt: "2026-05-20",
  },
  {
    id: "REV-103",
    user: "Nguyễn Văn Cường",
    watch: "Omega Speedmaster Moonwatch",
    rating: 4,
    comment: "Dòng Speedmaster huyền thoại thì không cần bàn cãi rồi. Đồng hồ lên cót tay rất êm, sai số thấp.",
    isApproved: true,
    createdAt: "2026-05-18",
  },
  {
    id: "REV-104",
    user: "Phạm Minh Hùng",
    watch: "Audemars Piguet Royal Oak",
    rating: 5,
    comment: "Mẫu Royal Oak này hiếm thực sự, tìm mãi mới thấy bên Tempus có sẵn hàng. Giao dịch an toàn, bảo hiểm vận chuyển chu đáo.",
    isApproved: false,
    createdAt: "2026-06-04",
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [search, setSearch] = useState("");
  const [filterApproved, setFilterApproved] = useState("all");

  // Reply state
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredReviews = reviews.filter((r) => {
    const matchSearch =
      r.user.toLowerCase().includes(search.toLowerCase()) ||
      r.watch.toLowerCase().includes(search.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(search.toLowerCase()));
    const matchStatus =
      filterApproved === "all" ? true :
      filterApproved === "approved" ? r.isApproved : !r.isApproved;
    return matchSearch && matchStatus;
  });

  const handleApprove = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
    );
    toast.success("Đã duyệt đánh giá!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      setReviews(reviews.filter((r) => r.id !== id));
      toast.success("Đã xóa đánh giá!");
    }
  };

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    toast.success(`Đã gửi phản hồi đánh giá ${id}: "${replyText}"`);
    setReplyId(null);
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-serif text-2xl text-ivory">Kiểm Duyệt Đánh Giá</h1>
        <p className="text-xs text-ivory/40">Duyệt đánh giá từ khách hàng trước khi hiển thị công khai</p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-dark-card border border-dark-border/30 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25" />
          <input
            type="text"
            placeholder="Tìm theo khách hàng, đồng hồ, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterApproved}
          onChange={(e) => setFilterApproved(e.target.value)}
          className="px-3 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory/70 focus:border-gold/40 cursor-pointer w-full md:w-auto"
        >
          <option value="all">Tất cả Trạng Thái</option>
          <option value="approved">Đã duyệt</option>
          <option value="pending">Chờ duyệt</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-xl bg-dark-card border border-dark-border/30 hover:border-gold/15 transition-all space-y-4"
          >
            {/* Header info */}
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] text-ivory/30 font-mono">Mã số: {rev.id}</span>
                <h3 className="text-sm font-semibold text-ivory/95 mt-1">{rev.user}</h3>
                <p className="text-xs text-gold/70 mt-0.5 font-medium">{rev.watch}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  rev.isApproved
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                }`}>
                  {rev.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                </span>

                <span className="text-[10px] text-ivory/30">{new Date(rev.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            {/* Stars & Comment */}
            <div className="space-y-2 border-t border-dark-border/10 pt-3 text-xs text-ivory/70">
              <div className="flex items-center gap-0.5 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < rev.rating ? "fill-gold text-gold" : "text-dark-border"}
                  />
                ))}
              </div>
              <p className="leading-relaxed bg-[#0E0E0E]/40 p-3 rounded-lg border border-dark-border/15 italic">
                "{rev.comment}"
              </p>
            </div>

            {/* Admin actions */}
            <div className="flex items-center justify-between border-t border-dark-border/10 pt-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {!rev.isApproved && (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <Check size={12} />
                    Phê duyệt
                  </button>
                )}
                <button
                  onClick={() => setReplyId(replyId === rev.id ? null : rev.id)}
                  className="px-3 py-1.5 bg-gold/10 text-gold border border-gold/25 hover:bg-gold/15 rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <MessageSquare size={12} />
                  Phản hồi
                </button>
              </div>

              <button
                onClick={() => handleDelete(rev.id)}
                className="p-2 text-ivory/30 hover:text-red-400 transition-colors"
                title="Xóa đánh giá"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Reply Form */}
            <AnimatePresence>
              {replyId === rev.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-4 bg-dark-bg/60 border border-dark-border/20 rounded-xl space-y-3 overflow-hidden text-xs"
                >
                  <label className="text-ivory/40 font-medium">Nội dung phản hồi (Admin)</label>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Cảm ơn quý khách đã tin tưởng và chọn mua sản phẩm tại Tempus..."
                    className="w-full px-3 py-2 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyId(null)}
                      className="px-3 py-1.5 border border-dark-border rounded-md text-[10px] text-ivory/50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => handleSendReply(rev.id)}
                      className="px-4 py-1.5 bg-gold text-dark-bg font-semibold rounded-md text-[10px]"
                    >
                      Gửi Phản Hồi
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
