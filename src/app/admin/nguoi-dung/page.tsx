"use client";

import { useState } from "react";
import {
  Search,
  User as UserIcon,
  UserCheck,
  UserMinus,
  Mail,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Lock,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

// Mock users database
const INITIAL_USERS = [
  {
    id: "USR-001",
    name: "Admin Tempus",
    email: "admin@tempus.vn",
    role: "ADMIN",
    status: "ACTIVE",
    phone: "0900000001",
    address: "Tempus Head Office",
    createdAt: "2025-01-01",
  },
  {
    id: "USR-002",
    name: "Lâm Hoàng Minh",
    email: "minh.lh@tempus.vn",
    role: "CUSTOMER",
    status: "ACTIVE",
    phone: "0912345678",
    address: "123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    createdAt: "2025-01-15",
  },
  {
    id: "USR-003",
    name: "Nguyễn Thu Trang",
    email: "trang.nt@tempus.vn",
    role: "STAFF",
    status: "ACTIVE",
    phone: "0987654321",
    address: "Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội",
    createdAt: "2025-03-10",
  },
  {
    id: "USR-004",
    name: "Phạm Quốc Huy",
    email: "huypq@gmail.com",
    role: "CUSTOMER",
    status: "BLOCKED",
    phone: "0934567890",
    address: "Bình Thạnh, TP. Hồ Chí Minh",
    createdAt: "2025-06-01",
  },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
};

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "text-red-400 bg-red-400/10 border-red-400/20",
  STAFF: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CUSTOMER: "text-ivory/50 bg-white/[0.04] border-dark-border",
};

interface UserType {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formRole, setFormRole] = useState("CUSTOMER");
  const [formStatus, setFormStatus] = useState("ACTIVE");

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormPhone("");
    setFormAddress("");
    setFormRole("CUSTOMER");
    setFormStatus("ACTIVE");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserType) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormPhone(user.phone || "");
    setFormAddress(user.address || "");
    setFormRole(user.role);
    setFormStatus(user.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formEmail || (!selectedUser && !formPassword)) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Email, Mật khẩu)");
      return;
    }

    if (selectedUser) {
      // Edit mode
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: formName,
                email: formEmail,
                ...(formPassword ? { password: formPassword } : {}),
                phone: formPhone,
                address: formAddress,
                role: formRole,
                status: formStatus,
              }
            : u
        )
      );
      toast.success("Cập nhật thông tin người dùng thành công!");
    } else {
      // Add mode
      const newUser: UserType = {
        id: "USR-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        name: formName,
        email: formEmail,
        password: formPassword,
        phone: formPhone,
        address: formAddress,
        role: formRole,
        status: formStatus,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsers([...users, newUser]);
      toast.success("Thêm người dùng mới thành công!");
    }

    handleCloseModal();
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản của: ${name}?`)) {
      setUsers(users.filter((u) => u.id !== id));
      toast.success("Đã xóa tài khoản người dùng thành công!");
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    setUsers(
      users.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );
    if (newStatus === "BLOCKED") {
      toast.warning("Đã khóa tài khoản người dùng!");
    } else {
      toast.success("Đã mở khóa tài khoản người dùng!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-serif text-2xl text-ivory">Quản Lý Người Dùng</h1>
          <p className="text-xs text-ivory/40">Thêm, chỉnh sửa thông tin, phân quyền vai trò (Admin, Staff, Customer) và xóa tài khoản</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-gold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} />
          Thêm Người Dùng
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-xl bg-dark-card border border-dark-border/30 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory placeholder:text-ivory/20 focus:border-gold/40"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-[#0E0E0E] border border-dark-border rounded-lg text-ivory/70 focus:border-gold/40 cursor-pointer w-full md:w-auto"
        >
          <option value="">Tất cả Vai Trò</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-xl bg-dark-card border border-dark-border/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border/20 text-[10px] font-semibold text-ivory/30 uppercase tracking-wider text-left">
                <th className="py-3 px-4">Tài khoản</th>
                <th className="py-3 px-4">Thông tin liên hệ</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày đăng ký</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-dark-border/10 hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 px-4 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/15 shrink-0">
                        <UserIcon size={14} className="text-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-ivory/95">{u.name}</p>
                        <span className="text-[10px] text-ivory/30 flex items-center gap-1 mt-0.5 font-mono">
                          Mật khẩu: <span className="text-gold/80">{u.id}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-ivory/70 flex items-center gap-1 text-[11px]">
                        <Mail size={10} className="text-gold/40" />
                        {u.email}
                      </p>
                      {u.phone && (
                        <p className="text-ivory/50 text-[10px] flex items-center gap-1">
                          <Phone size={10} className="text-gold/40" />
                          {u.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ROLE_STYLES[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      u.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {u.status === "ACTIVE" ? "HOẠT ĐỘNG" : "BỊ KHÓA"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-ivory/40">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-gold/40" />
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          u.status === "ACTIVE"
                            ? "text-ivory/20 hover:text-red-400 hover:bg-red-500/5"
                            : "text-ivory/20 hover:text-emerald-400 hover:bg-emerald-500/5"
                        }`}
                        title={u.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      >
                        {u.status === "ACTIVE" ? <UserMinus size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="p-2 rounded-lg text-ivory/20 hover:text-gold hover:bg-gold/5 transition-colors"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-2 rounded-lg text-ivory/20 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                        title="Xóa người dùng"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-dark border border-dark-border/40 rounded-2xl shadow-dark-lg p-6 sm:p-8 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-ivory/30 hover:text-ivory/60 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="heading-serif text-xl text-gold mb-6 border-b border-dark-border/10 pb-3">
              {selectedUser ? "Chỉnh Sửa Người Dùng" : "Thêm Người Dùng Mới"}
            </h2>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/40 uppercase font-medium">Họ & Tên *</label>
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20" />
                    <input
                      type="text"
                      required
                      placeholder="Lâm Hoàng Minh"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-dark-bg/60 border border-dark-border rounded-lg text-xs text-ivory focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/40 uppercase font-medium">Số Điện Thoại</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20" />
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-dark-bg/60 border border-dark-border rounded-lg text-xs text-ivory focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/40 uppercase font-medium">Địa chỉ Email *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-dark-bg/60 border border-dark-border rounded-lg text-xs text-ivory focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/40 uppercase font-medium">Mật Khẩu *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20" />
                    <input
                      type="text"
                      required
                      placeholder="••••••••"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-dark-bg/60 border border-dark-border rounded-lg text-xs text-ivory focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-ivory/40 uppercase font-medium">Địa Chỉ Giao Hàng</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-2.5 text-ivory/20" />
                  <textarea
                    rows={2}
                    placeholder="Quận 1, TP. Hồ Chí Minh"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-dark-bg/60 border border-dark-border rounded-lg text-xs text-ivory focus:border-gold/40 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/40 uppercase font-medium">Vai Trò</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-bg/60 border border-dark-border rounded-lg text-xs text-ivory focus:border-gold/40 cursor-pointer"
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k} className="bg-dark-card">{v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/40 uppercase font-medium">Trạng Thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-bg/60 border border-dark-border rounded-lg text-xs text-ivory focus:border-gold/40 cursor-pointer"
                  >
                    <option value="ACTIVE" className="bg-dark-card">Hoạt Động</option>
                    <option value="BLOCKED" className="bg-dark-card">Bị Khóa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-border/10">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-dark-border hover:bg-dark-card rounded-lg text-[10px] uppercase font-semibold text-ivory/50 hover:text-ivory"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold hover:bg-gold-light text-dark-bg rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors"
                >
                  {selectedUser ? "Lưu Thay Đổi" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
