"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Package, ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";
import { WATCHES } from "@/lib/mock-data";
import { toast } from "sonner";

// Mock inventory transactions database
const INITIAL_TRANSACTIONS = [
  {
    id: "TRX-5541",
    watchName: "Rolex Submariner Date 41mm",
    sku: "RLX-SUB-001",
    type: "IMPORT", // IMPORT, EXPORT, ADJUSTMENT
    quantity: 5,
    operator: "Admin",
    note: "Nhập hàng từ nhà cung cấp Swiss Luxury Corp",
    createdAt: "2026-05-28T08:30:00Z",
  },
  {
    id: "TRX-5542",
    watchName: "Cartier Santos de Cartier Medium",
    sku: "CTR-SNT-001",
    type: "EXPORT",
    quantity: 1,
    operator: "Staff",
    note: "Xuất kho giao cho đơn hàng ORD-2025002",
    createdAt: "2026-06-02T15:00:00Z",
  },
  {
    id: "TRX-5543",
    watchName: "Audemars Piguet Royal Oak 41mm",
    sku: "AP-RO-001",
    type: "ADJUSTMENT",
    quantity: -1,
    operator: "Admin",
    note: "Điều chỉnh số lượng thực tế sau kiểm kê định kỳ",
    createdAt: "2026-06-03T17:30:00Z",
  },
];

export default function AdminInventoryPage() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [watches, setWatches] = useState(WATCHES);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [selectedWatchId, setSelectedWatchId] = useState(WATCHES[0].id);
  const [transactionType, setTransactionType] = useState<"IMPORT" | "EXPORT" | "ADJUSTMENT">("IMPORT");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.watchName.toLowerCase().includes(search.toLowerCase()) ||
      t.sku.toLowerCase().includes(search.toLowerCase()) ||
      t.note.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter ? t.type === typeFilter : true;
    return matchSearch && matchType;
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const watch = watches.find((w) => w.id === selectedWatchId);
    if (!watch) return;

    const quantityNum = parseInt(qty);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ!");
      return;
    }

    const adjustQty = transactionType === "EXPORT" ? -quantityNum : quantityNum;
    
    // Update watch stock
    const updatedWatches = watches.map((w) => {
      if (w.id === selectedWatchId) {
        const finalStock = Math.max(0, w.stock + adjustQty);
        return { ...w, stock: finalStock };
      }
      return w;
    });
    setWatches(updatedWatches);

    // Add transaction log
    const newTrx = {
      id: "TRX-" + Date.now().toString().slice(-4),
      watchName: watch.name,
      sku: watch.sku,
      type: transactionType,
      quantity: quantityNum,
      operator: "Admin",
      note,
      createdAt: new Date().toISOString(),
    };

    setTransactions([newTrx, ...transactions]);
    toast.success(`Đã ghi nhận giao dịch kho hàng: ${transactionType} ${quantityNum} chiếc`);
    setIsModalOpen(false);
    setNote("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-serif text-2xl text-ivory">Lịch Sử Giao Dịch Kho</h1>
          <p className="text-xs text-ivory/40">Ghi nhận hoạt động nhập, xuất và cân chỉnh tồn kho thực tế</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-gold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          Giao Dịch Kho Mới
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng số lượng tồn kho", value: watches.reduce((acc, w) => acc + w.stock, 0), icon: Package, color: "text-gold bg-gold/5 border-gold/10" },
          { label: "Nhập kho (Tháng)", value: transactions.filter(t => t.type === "IMPORT").reduce((acc, t) => acc + t.quantity, 0), icon: ArrowUpRight, color: "text-emerald-400 bg-emerald-400/5 border-emerald-400/10" },
          { label: "Xuất kho (Tháng)", value: transactions.filter(t => t.type === "EXPORT").reduce((acc, t) => acc + t.quantity, 0), icon: ArrowDownRight, color: "text-red-400 bg-red-400/5 border-red-400/10" },
          { label: "Sản phẩm sắp hết hàng", value: watches.filter(w => w.stock > 0 && w.stock < 3).length, icon: AlertTriangle, color: "text-yellow-400 bg-yellow-400/5 border-yellow-400/10" },
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

      {/* Filters */}
      <div className="p-4 rounded-xl bg-dark-card border border-dark-border/30 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25" />
          <input
            type="text"
            placeholder="Tìm theo sản phẩm, mã SKU, ghi chú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20"
          />
        </div>

        {/* Transaction Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory/70 focus:border-gold/40 cursor-pointer w-full md:w-auto"
        >
          <option value="">Tất cả Nghiệp Vụ</option>
          <option value="IMPORT">Nhập Kho (Import)</option>
          <option value="EXPORT">Xuất Kho (Export)</option>
          <option value="ADJUSTMENT">Cân Chỉnh (Adjustment)</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-6 rounded-xl bg-dark-card border border-dark-border/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border/20 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider text-left">
                <th className="py-3 px-4">Mã giao dịch</th>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4 text-center">Nghiệp vụ</th>
                <th className="py-3 px-4 text-center">Số lượng</th>
                <th className="py-3 px-4">Thực hiện</th>
                <th className="py-3 px-4">Mô tả / Ghi chú</th>
                <th className="py-3 px-4 text-right">Ngày thực hiện</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="border-b border-dark-border/10 hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 px-4 text-xs font-mono text-gold/80 font-semibold">{t.id}</td>
                  <td className="py-4 px-4 text-xs">
                    <p className="font-semibold text-ivory/85">{t.watchName}</p>
                    <span className="text-[9px] font-mono text-ivory/30">SKU: {t.sku}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                      t.type === "IMPORT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      t.type === "EXPORT" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}>
                      {t.type === "IMPORT" ? "NHẬP KHO" : t.type === "EXPORT" ? "XUẤT KHO" : "CÂN CHỈNH"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-center text-ivory/80">
                    {t.type === "EXPORT" ? "-" : "+"}
                    {t.quantity} chiếc
                  </td>
                  <td className="py-4 px-4 text-xs text-ivory/60">{t.operator}</td>
                  <td className="py-4 px-4 text-xs text-ivory/50 max-w-[240px] truncate" title={t.note}>
                    {t.note || "-"}
                  </td>
                  <td className="py-4 px-4 text-xs text-ivory/40 text-right">
                    {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Transaction */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full glass-dark p-6 rounded-2xl border border-dark-border/50 text-ivory relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-ivory/30 hover:text-ivory/70 transition-colors text-lg"
              >
                ✕
              </button>

              <h2 className="heading-serif text-xl text-gold mb-6 border-b border-dark-border/20 pb-3">
                Giao Dịch Kho Hàng Mới
              </h2>

              <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
                {/* Watch selection */}
                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Chọn sản phẩm đồng hồ *</label>
                  <select
                    value={selectedWatchId}
                    onChange={(e) => setSelectedWatchId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory focus:border-gold/40 cursor-pointer"
                  >
                    {watches.map((w) => (
                      <option key={w.id} value={w.id} className="bg-dark-card">{w.name} (Tồn: {w.stock})</option>
                    ))}
                  </select>
                </div>

                {/* Transaction Type */}
                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Nghiệp vụ kho *</label>
                  <div className="flex gap-2">
                    {[
                      { type: "IMPORT", label: "Nhập Kho" },
                      { type: "EXPORT", label: "Xuất Kho" },
                      { type: "ADJUSTMENT", label: "Cân Chỉnh" },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setTransactionType(item.type as any)}
                        className={`flex-1 py-2 rounded-lg font-semibold uppercase tracking-wider transition-all border ${
                          transactionType === item.type
                            ? "bg-gold/15 text-gold border-gold/40"
                            : "text-ivory/40 border-dark-border hover:text-ivory"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Số lượng giao dịch (chiếc) *</label>
                  <input
                    type="number"
                    required
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory focus:border-gold/40"
                  />
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Ghi chú giao dịch</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập lý do nghiệp vụ (nhập hàng Thụy Sĩ, xuất trả bảo hành, kiểm kê lệch...)"
                    className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory focus:border-gold/40 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-dark-border/20">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-dark-border hover:bg-dark-card rounded-lg font-semibold uppercase text-ivory/50 hover:text-ivory"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gold hover:bg-gold-light text-dark-bg rounded-lg font-semibold uppercase transition-colors"
                  >
                    Ghi Nhận
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
