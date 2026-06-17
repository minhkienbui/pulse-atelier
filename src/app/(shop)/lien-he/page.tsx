"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Navigation } from "lucide-react";
import { toast } from "sonner";

const SHOWROOMS = [
  {
    city: "HÀ NỘI",
    name: "Tempus Showroom Hoàn Kiếm",
    address: "Số 15 Ngô Quyền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
    hotline: "1900 8888 (Phím 1)",
    email: "hn.showroom@tempus.vn",
    hours: "09:00 - 21:00 (Tất cả các ngày trong tuần)",
  },
  {
    city: "TP. HỒ CHÍ MINH",
    name: "Tempus Showroom Bến Thành",
    address: "123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    hotline: "1900 8888 (Phím 2)",
    email: "hcm.showroom@tempus.vn",
    hours: "09:00 - 21:30 (Tất cả các ngày trong tuần)",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      toast.success("Thông tin liên hệ của bạn đã được gửi thành công! Đội ngũ tư vấn sẽ liên hệ lại sớm nhất.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Banner / Header */}
      <section className="relative py-20 bg-dark-surface/30 border-b border-dark-border/20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/[0.03] rounded-full blur-[120px]" />
        
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-gold mb-2">
            <Mail size={12} className="text-gold" />
            <span className="text-[10px] font-semibold text-gold tracking-wider uppercase font-mono">Get in touch</span>
          </div>
          
          <h1 className="heading-serif text-4xl sm:text-5xl text-ivory">
            Liên Hệ Với Chúng Tôi
          </h1>
          
          <p className="text-sm text-ivory/50 max-w-xl mx-auto leading-relaxed">
            Dịch vụ chăm sóc khách hàng chuyên nghiệp sẵn sàng giải đáp mọi thắc mắc của quý khách. 
            Đặt lịch hẹn trải nghiệm các mẫu đồng hồ cao cấp tại showroom gần nhất.
          </p>
          
          <div className="line-gold w-16 h-[2px] bg-gold mt-4 mx-auto" />
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Info & Showrooms - Left (7 columns on desktop) */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-semibold">Hệ thống showroom</span>
              <h2 className="heading-serif text-2xl text-ivory mt-1">Gặp gỡ trực tiếp</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {SHOWROOMS.map((room) => (
                <div
                  key={room.city}
                  className="p-6 rounded-2xl border border-dark-border/40 bg-dark-card/20 space-y-4 hover:border-gold/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <span className="badge-gold text-[9px] font-mono px-2 py-0.5">{room.city}</span>
                    <Navigation size={14} className="text-gold/50 cursor-pointer hover:text-gold" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-ivory">{room.name}</h3>
                    <div className="space-y-2 text-[11px] text-ivory/50 leading-relaxed font-light">
                      <p className="flex items-start gap-2">
                        <MapPin size={12} className="text-gold shrink-0 mt-0.5" />
                        <span>{room.address}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone size={12} className="text-gold shrink-0" />
                        <span>{room.hotline}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail size={12} className="text-gold shrink-0" />
                        <span>{room.email}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <Clock size={12} className="text-gold shrink-0 mt-0.5" />
                        <span>{room.hours}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* General Contacts */}
            <div className="p-6 rounded-2xl glass-gold border border-gold/15 space-y-4 relative overflow-hidden">
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <Mail size={100} className="text-gold" />
              </div>
              <h3 className="text-xs font-bold text-gold uppercase tracking-wider">Thông Tin Liên Hệ Tổng Hợp</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-ivory/30 text-[10px] uppercase font-mono">Đường dây nóng</p>
                  <p className="text-gold font-bold text-base mt-1">1900 8888</p>
                </div>
                <div>
                  <p className="text-ivory/30 text-[10px] uppercase font-mono">Email hỗ trợ</p>
                  <p className="text-ivory/80 mt-1 font-semibold">support@tempus.vn</p>
                </div>
                <div>
                  <p className="text-ivory/30 text-[10px] uppercase font-mono">Tuyển dụng</p>
                  <p className="text-ivory/80 mt-1 font-semibold">hr@tempus.vn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form - Right (5 columns on desktop) */}
          <div className="lg:col-span-5">
            <div className="glass-dark p-6 sm:p-8 rounded-2xl border border-dark-border/40 space-y-6">
              <div className="space-y-1.5 text-center">
                <span className="text-[10px] tracking-[0.2em] uppercase text-gold/70 font-semibold font-mono">Send a message</span>
                <h3 className="heading-serif text-xl text-ivory">Gửi Yêu Cầu Tư Vấn</h3>
                <div className="line-gold w-8 h-[1px] bg-gold mx-auto mt-2" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/50 font-medium uppercase tracking-wide">Họ tên của bạn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lâm Hoàng Minh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-xs text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-ivory/50 font-medium uppercase tracking-wide">Địa chỉ Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="minh@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-xs text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-ivory/50 font-medium uppercase tracking-wide">Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-xs text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-ivory/50 font-medium uppercase tracking-wide">Nội dung yêu cầu *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tôi cần đặt lịch hẹn xem đồng hồ Rolex..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-bg/60 border border-dark-border/50 rounded-lg text-xs text-ivory placeholder:text-ivory/20 focus:border-gold/40 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-3.5 text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <Send size={12} />
                  {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Styled Dark Map Section */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="relative h-[350px] rounded-2xl border border-dark-border/40 overflow-hidden bg-dark-surface/40 flex items-center justify-center">
          {/* Map abstract design */}
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle, rgba(201,168,76,0.5) 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px'
          }} />
          {/* Curved glowing map roads abstract */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,100 Q300,50 600,200 T1500,100" fill="none" stroke="#C9A84C" strokeWidth="2" />
            <path d="M-50,250 Q450,150 700,300 T2000,180" fill="none" stroke="#C9A84C" strokeWidth="1" />
            <path d="M100,-50 Q400,200 200,450" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
          </svg>

          {/* Pins */}
          <div className="absolute left-[35%] top-[40%] flex flex-col items-center">
            <div className="p-2 rounded-full bg-gold/15 border border-gold/40 animate-pulse">
              <MapPin size={18} className="text-gold" />
            </div>
            <span className="text-[10px] font-bold text-gold/80 mt-1 bg-dark-bg/90 px-2 py-0.5 rounded border border-dark-border/50">Tempus Hoàn Kiếm</span>
          </div>

          <div className="absolute left-[65%] top-[55%] flex flex-col items-center">
            <div className="p-2 rounded-full bg-gold/15 border border-gold/40 animate-pulse">
              <MapPin size={18} className="text-gold" />
            </div>
            <span className="text-[10px] font-bold text-gold/80 mt-1 bg-dark-bg/90 px-2 py-0.5 rounded border border-dark-border/50">Tempus Bến Thành</span>
          </div>

          <div className="relative z-10 text-center max-w-sm space-y-3 p-6 glass-dark border border-dark-border/40 rounded-xl">
            <Navigation size={24} className="text-gold mx-auto" />
            <h4 className="text-xs font-semibold text-ivory">Bản Đồ Showroom Toàn Quốc</h4>
            <p className="text-[10px] text-ivory/40 leading-relaxed">
              Nhấn nút định vị trên từng showroom ở phần liên hệ hoặc nhấp bên dưới để mở rộng xem bản đồ Google Maps của từng chi nhánh.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
