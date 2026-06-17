"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, Mail, Phone, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";

// Mock suppliers database
const INITIAL_SUPPLIERS = [
  {
    id: "SUP-001",
    name: "Swiss Luxury Corp (Geneva)",
    contactEmail: "supply@swissluxury.ch",
    phone: "+41 22 789 0123",
    address: "Rue du Rhône 12, 1204 Genève, Thụy Sĩ",
  },
  {
    id: "SUP-002",
    name: "Watch Alliance Europe",
    contactEmail: "info@watchalliance.eu",
    phone: "+49 89 5432 109",
    address: "Maximilianstraße 35, 80539 München, Đức",
  },
  {
    id: "SUP-003",
    name: "Đông Dương Watch Import",
    contactEmail: "import@dongduongwatch.vn",
    phone: "024 3987 6543",
    address: "45 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
  },
];

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contactEmail && s.contactEmail.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingSupplier(null);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setIsModalOpen(true);
  };

  const openEditModal = (sup: any) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setEmail(sup.contactEmail || "");
    setPhone(sup.phone || "");
    setAddress(sup.address || "");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Vui lòng điền tên nhà cung cấp!");
      return;
    }

    const payload = {
      name,
      contactEmail: email,
      phone,
      address,
    };

    if (editingSupplier) {
      setSuppliers(suppliers.map((s) => (s.id === editingSupplier.id ? { ...s, ...payload } : s)));
      toast.success("Cập nhật nhà cung cấp thành công!");
    } else {
      const newSup = {
        id: "SUP-" + Date.now().toString().slice(-3),
        ...payload,
      };
      setSuppliers([...suppliers, newSup]);
      toast.success("Thêm mới nhà cung cấp thành công!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Xóa nhà cung cấp này sẽ làm mất liên kết lịch sử nhập hàng. Bạn có chắc chắn muốn xóa?")) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
      toast.success("Đã xóa nhà cung cấp!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-serif text-2xl text-ivory">Quản Lý Nhà Cung Cấp</h1>
          <p className="text-xs text-ivory/40">Quản lý danh sách đầu mối nhập hàng quốc tế & nội địa</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-gold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          Thêm Nhà Cung Cấp
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-dark-card border border-dark-border/30">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25" />
          <input
            type="text"
            placeholder="Tìm theo tên nhà cung cấp, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="p-5 rounded-xl bg-dark-card border border-dark-border/30 hover:border-gold/25 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center border border-gold/20 shrink-0">
                    <Truck size={16} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-ivory/90">{sup.name}</h3>
                    <span className="text-[9px] text-ivory/30 font-mono">Mã: {sup.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(sup)}
                    className="p-1.5 text-ivory/30 hover:text-gold transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(sup.id)}
                    className="p-1.5 text-ivory/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Info Detail */}
              <div className="space-y-2 text-xs text-ivory/60 border-t border-dark-border/10 pt-3">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-gold/45 shrink-0" />
                  <span className="truncate">{sup.contactEmail || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-gold/45 shrink-0" />
                  <span>{sup.phone || "-"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={12} className="text-gold/45 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{sup.address || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
                {editingSupplier ? "Chỉnh Sửa Nhà Cung Cấp" : "Thêm Nhà Cung Cấp"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Tên nhà cung cấp *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Swiss Luxury Corp"
                    className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory focus:border-gold/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Email liên hệ</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="supply@swissluxury.ch"
                    className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory focus:border-gold/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+41 22 789 0123"
                    className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory focus:border-gold/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-ivory/40 font-medium">Địa chỉ văn phòng / Kho hàng</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Địa chỉ trụ sở chính..."
                    className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory focus:border-gold/40 resize-none"
                  />
                </div>

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
                    Lưu Lại
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
