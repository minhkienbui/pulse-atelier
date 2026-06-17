"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (password.length < 8) {
      toast.error("Mật khẩu phải dài ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, address }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Đăng ký tài khoản thành công!");
        router.push("/dang-nhap");
      } else {
        toast.error(data.message || "Đăng ký thất bại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra trong quá trình đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 relative overflow-hidden bg-dark-bg">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/[0.02] rounded-full blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.01]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-dark p-8 rounded-2xl border border-dark-border/40 shadow-dark-lg text-center space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.4em] uppercase text-gold font-semibold">
              Gia nhập thế giới tinh hoa
            </span>
            <h1 className="heading-serif text-3xl text-ivory">
              Đăng Ký Tài Khoản
            </h1>
            <div className="line-gold w-12 h-[1.5px] bg-gold mt-2 mx-auto" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs text-ivory/50 font-medium">
                Họ và Tên *
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
                />
                <input
                  type="text"
                  placeholder="Lâm Hoàng Minh"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-ivory/50 font-medium">
                  Email *
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
                  />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ivory/50 font-medium">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
                  />
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-ivory/50 font-medium">
                Địa chỉ giao hàng
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
                />
                <input
                  type="text"
                  placeholder="Quận 1, TP. Hồ Chí Minh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-ivory/50 font-medium">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ivory/50 font-medium">
                  Xác nhận mật khẩu *
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <UserPlus size={14} />
              {loading ? "Đang đăng ký..." : "Đăng Ký Tài Khoản"}
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs pt-4 border-t border-dark-border/10">
            <Link
              href="/dang-nhap"
              className="flex items-center gap-1.5 text-ivory/40 hover:text-gold transition-colors"
            >
              <ArrowLeft size={14} />
              Quay lại Đăng nhập
            </Link>
            <span className="text-ivory/30">
              Đã có tài khoản?{" "}
              <Link
                href="/dang-nhap"
                className="text-gold font-semibold hover:text-gold-light transition-colors"
              >
                Đăng nhập
              </Link>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
