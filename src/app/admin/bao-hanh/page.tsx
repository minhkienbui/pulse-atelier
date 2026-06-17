"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Wrench, Eye, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const INITIAL_REQUESTS = [
  {
    id: "WR-9921",
    customer: "Lâm Hoàng Minh",
    phone: "0912345678",
    watchName: "Cartier Santos de Cartier Medium",
    serialNumber: "CTR-8871-S22",
    issue: "Mặt kính bị xước nhẹ ở góc 3 giờ, cần đánh bóng",
    status: "COMPLETED",
    estimatedCost: 1500000,
    adminNote: "Đã đánh bóng mặt kính sapphire bảo đảm tiêu chuẩn hãng. Miễn phí theo chế độ bảo hành vàng của Tempus.",
    createdAt: "2026-02-10T10:30:00Z",
  },
  {
    id: "WR-1042",
    customer: "Lâm Hoàng Minh",
    phone: "0912345678",
    watchName: "Rolex Submariner Date 41mm",
    serialNumber: "RLX-9823-A81",
    issue: "Sai lệch thời gian chạy nhanh 8 giây/ngày",
    status: "IN_PROGRESS",
    estimatedCost: 0,
    adminNote: "Đang tiến hành căn chỉnh sai số máy caliber 3235.",
    createdAt: "2026-05-28T09:00:00Z",
  },
  {
    id: "WR-2051",
    customer: "Nguyễn Văn Cường",
    phone: "0983456789",
    watchName: "Omega Speedmaster Moonwatch",
    serialNumber: "OMG-2291-K18",
    issue: "Kính Plexiglass (Hesalite) bị vỡ do va đập mạnh",
    status: "PENDING",
    estimatedCost: null,
    adminNote: "",
    createdAt: "2026-06-04T12:00:00Z",
  },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  IN_PROGRESS: "Đang bảo dưỡng",
  COMPLETED: "Đã hoàn thành",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function AdminWarrantyPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Details Modal
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  // Form edit states
  const [cost, setCost] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.watchName.toLowerCase().includes(search.toLowerCase()) ||
      r.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? r.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setRequests(
      requests.map((r) =>
        r.id === selectedReq.id
          ? {
              ...r,
              estimatedCost: cost ? parseFloat(cost) : 0,
              adminNote,
            }
          : r
      )
    );
    toast.success(`Đã cập nhật phiếu bảo dưỡng ${selectedReq.id}`);
    setSelectedReq(null);
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    toast.success(`Đã chuyển đổi trạng thái sang: ${STATUS_LABELS[newStatus]}`);
    if (selectedReq && selectedReq.id === id) {
      setSelectedReq({ ...selectedReq, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-serif text-2xl text-ivory">Quản Lý Bảo Hành & Sửa Chữa</h1>
        <p className="text-xs text-ivory/40">Tiếp nhận máy, thẩm định báo giá, và cập nhật tiến độ bảo dưỡng</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng số yêu cầu", value: requests.length, icon: Wrench, color: "text-gold bg-gold/5 border-gold/10" },
          { label: "Chờ thẩm định", value: requests.filter(r => r.status === "PENDING").length, icon: AlertTriangle, color: "text-yellow-400 bg-yellow-400/5 border-yellow-400/10" },
          { label: "Đang xử lý", value: requests.filter(r => r.status === "IN_PROGRESS").length, icon: Clock, color: "text-blue-400 bg-blue-400/5 border-blue-400/10" },
          { label: "Hoàn thành", value: requests.filter(r => r.status === "COMPLETED").length, icon: ShieldCheck, color: "text-emerald-400 bg-emerald-400/5 border-emerald-400/10" },
        ].map((item) => (
          <div key={item.label} className={`p-4 rounded-xl border ${item.color} flex items-center gap-3`}>
            <div className="p-2 rounded-lg bg-black/40">
              <item.icon size={16} />
            </div>
            <div>
              <p className="text-lg font-bold text-ivory">{item.value}</p>
              <p className="text-[10px] text-ivory/40 uppercase tracking-wider">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-xl bg-dark-card border border-dark-border/30 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25" />
          <input
            type="text"
            placeholder="Tìm theo khách hàng, serial, đồng hồ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory/70 focus:border-gold/40 cursor-pointer w-full md:w-auto"
        >
          <option value="">Tất cả Trạng Thái</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="p-6 rounded-xl bg-dark-card border border-dark-border/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border/20 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider text-left">
                <th className="py-3 px-4">Mã phiếu</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Đồng hồ / Serial</th>
                <th className="py-3 px-4">Ngày nhận</th>
                <th className="py-3 px-4 text-right">Chi phí dự kiến</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r.id} className="border-b border-dark-border/10 hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 px-4 text-xs font-mono text-gold/80 font-semibold">{r.id}</td>
                  <td className="py-4 px-4 text-xs">
                    <p className="font-semibold text-ivory/85">{r.customer}</p>
                    <span className="text-[10px] text-ivory/30">{r.phone}</span>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <p className="font-semibold text-ivory/80">{r.watchName}</p>
                    <span className="text-[9px] font-mono text-gold/75">SN: {r.serialNumber}</span>
                  </td>
                  <td className="py-4 px-4 text-xs text-ivory/40">
                    {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-4 px-4 text-xs font-bold text-gold text-right">
                    {r.estimatedCost !== null ? formatPrice(r.estimatedCost) : "Chưa báo giá"}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedReq(r);
                        setCost(r.estimatedCost?.toString() || "");
                        setAdminNote(r.adminNote || "");
                      }}
                      className="p-1.5 text-ivory/30 hover:text-gold transition-colors"
                      title="Quản lý phiếu"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details/Edit Modal */}
      <AnimatePresence>
        {selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full glass-dark p-6 rounded-2xl border border-dark-border/50 text-ivory relative"
            >
              <button
                onClick={() => setSelectedReq(null)}
                className="absolute top-4 right-4 text-ivory/30 hover:text-ivory/70 transition-colors text-lg"
              >
                ✕
              </button>

              <h2 className="heading-serif text-xl text-gold mb-1">Phiếu Bảo Dưỡng</h2>
              <p className="text-xs text-ivory/40 font-mono mb-4">Phiếu: {selectedReq.id}</p>

              {/* Watch Details */}
              <div className="p-3.5 bg-dark-bg/40 border border-dark-border/20 rounded-xl space-y-2 text-xs mb-4">
                <p>Khách hàng: <strong className="text-ivory">{selectedReq.customer} ({selectedReq.phone})</strong></p>
                <p>Đồng hồ: <strong className="text-ivory">{selectedReq.watchName}</strong></p>
                <p>Số Serial: <strong className="text-gold font-mono">{selectedReq.serialNumber}</strong></p>
                <p className="border-t border-dark-border/10 pt-2 text-red-400 font-medium">⚠️ Vấn đề: {selectedReq.issue}</p>
              </div>

              {/* Status Update */}
              <div className="space-y-3 mb-6">
                <p className="text-xs text-ivory/40 font-medium">Trạng thái bảo dưỡng:</p>
                <div className="flex gap-2">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => handleUpdateStatus(selectedReq.id, k)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                        selectedReq.status === k
                          ? "bg-gold/15 text-gold border-gold/40 shadow-[var(--shadow-gold-sm)]"
                          : "text-ivory/40 border-dark-border/60 hover:text-ivory hover:border-ivory/40"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Báo giá dự kiến (VNĐ) - Nhập 0 nếu miễn phí</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="1500000"
                    className="w-full px-3 py-2 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory focus:border-gold/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Ý kiến đánh giá chuyên môn / Ghi chú từ hãng</label>
                  <textarea
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Mô tả các công việc kỹ thuật cần làm hoặc linh kiện thay thế..."
                    className="w-full px-3 py-2 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory focus:border-gold/40 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-dark-border/20">
                  <button
                    type="button"
                    onClick={() => setSelectedReq(null)}
                    className="px-4 py-2 border border-dark-border hover:bg-dark-card rounded-lg font-semibold uppercase text-ivory/50 hover:text-ivory"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gold hover:bg-gold-light text-dark-bg rounded-lg font-semibold uppercase transition-colors"
                  >
                    Cập Nhật
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
