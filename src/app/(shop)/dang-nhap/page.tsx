"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, LogIn, Mail } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(
          "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu."
        );
        return;
      }

      toast.success("Đăng nhập thành công!");

      const session = await getSession();

      if (session?.user.role === "ADMIN" || session?.user.role === "STAFF") {
        router.push("/admin");
      } else {
        router.push("/tai-khoan");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi đăng nhập.");
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
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-dark p-8 rounded-2xl border border-dark-border/40 shadow-dark-lg text-center space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.4em] uppercase text-gold font-semibold">
              Cổng thông tin khách hàng
            </span>
            <h1 className="heading-serif text-3xl text-ivory">Đăng Nhập</h1>
            <div className="line-gold w-12 h-[1.5px] bg-gold mt-2 mx-auto" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs text-ivory/50 font-medium">
                Email của bạn
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
                />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-ivory/50 font-medium">
                  Mật khẩu
                </label>
                <Link
                  href="#"
                  className="text-[11px] text-gold/60 hover:text-gold transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <LogIn size={14} />
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="h-[1px] bg-dark-border/40 flex-1" />
            <span className="text-[10px] text-ivory/25 uppercase tracking-wider">
              Hoặc tiếp tục với
            </span>
            <div className="h-[1px] bg-dark-border/40 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => signIn("google")}
              className="flex items-center justify-center gap-2 py-2.5 bg-dark-bg border border-dark-border/40 rounded-lg text-xs text-ivory/60 hover:text-ivory hover:border-gold/30 transition-all"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn("facebook")}
              className="flex items-center justify-center gap-2 py-2.5 bg-dark-bg border border-dark-border/40 rounded-lg text-xs text-ivory/60 hover:text-ivory hover:border-gold/30 transition-all"
            >
              Facebook
            </button>
          </div>

          <div className="text-xs text-ivory/40">
            Chưa có tài khoản?{" "}
            <Link
              href="/dang-ky"
              className="text-gold font-semibold hover:text-gold-light transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
