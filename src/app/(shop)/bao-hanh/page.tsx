"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Clock, Settings, Wrench, ChevronDown, CheckCircle2 } from "lucide-react";

const WARRANTY_PACKAGES = [
  {
    name: "STANDARD WARRANTY",
    duration: "2 NĂM",
    target: "Áp dụng cho mọi sản phẩm",
    benefits: [
      "Bảo hành lỗi kỹ thuật từ nhà sản xuất",
      "Hỗ trợ căn chỉnh nhanh/chậm miễn phí",
      "Vệ sinh dây vỏ máy siêu âm 1 lần/năm",
      "Thay pin miễn phí trọn đời (đối với máy Quartz)",
      "Giảm 10% chi phí linh kiện thay thế ngoài bảo hành",
    ],
    border: "border-dark-border/40",
    bg: "bg-dark-card/25",
  },
  {
    name: "PREMIUM WARRANTY",
    duration: "5 NĂM",
    target: "Áp dụng cho đồng hồ trên 100 triệu",
    benefits: [
      "Bao gồm toàn bộ quyền lợi gói Standard",
      "Bảo hành cả lỗi người dùng (vào nước nhẹ, từ hóa)",
      "Đánh bóng mặt kính và vỏ máy miễn phí 1 lần",
      "Miễn phí kiểm tra chống nước định kỳ hàng năm",
      "Giao nhận bảo hành miễn phí tại nhà (nội thành)",
      "Giảm 20% chi phí linh kiện thay thế ngoài bảo hành",
    ],
    border: "border-gold/30 shadow-[var(--shadow-gold-sm)]",
    bg: "bg-gold/[0.02]",
    tag: "Được chọn nhiều nhất",
  },
  {
    name: "GOLD WARRANTY",
    duration: "TRỌN ĐỜI",
    target: "Đặc quyền VIP (Đồng hồ trên 500 triệu)",
    benefits: [
      "Bảo hành trọn đời mọi chi tiết kỹ thuật cơ học",
      "Miễn phí bảo dưỡng lau dầu định kỳ 3 năm/lần",
      "Đánh bóng phục hồi trọn vẹn ngoại quan miễn phí",
      "Hỗ trợ giao nhận bảo hành miễn phí toàn quốc",
      "Cung cấp đồng hồ đeo thay thế trong thời gian bảo dưỡng",
      "Đội ngũ kỹ thuật trưởng Thụy Sĩ trực tiếp xử lý",
    ],
    border: "border-gold-light/40 shadow-dark-lg",
    bg: "bg-gold/[0.04]",
  },
];

const MAINTENANCE_STEPS = [
  {
    step: "01",
    title: "Tiếp Nhận & Khảo Sát",
    desc: "Ghi nhận trạng thái bên ngoài của đồng hồ, chụp ảnh tư liệu và kiểm tra các chức năng cơ bản.",
    icon: ShieldCheck,
  },
  {
    step: "02",
    title: "Thẩm Định Chi Tiết",
    desc: "Kỹ thuật viên sử dụng thiết bị chuyên dụng để kiểm tra sai số chạy máy, độ chống nước và tình trạng dầu bôi trơn.",
    icon: Settings,
  },
  {
    step: "03",
    title: "Lau Dầu & Bảo Dưỡng",
    desc: "Tháo rời hoàn toàn bộ máy, vệ sinh siêu âm từng linh kiện, lắp ráp và tra dầu bôi trơn Thụy Sĩ tiêu chuẩn hãng.",
    icon: Wrench,
  },
  {
    step: "04",
    title: "Cân Chỉnh & Kiểm Tra Nước",
    desc: "Hiệu chỉnh sai số trong 5 vị trí khác nhau. Thử áp suất khô và ướt để bảo đảm khả năng chống thấm nước tối đa.",
    icon: Clock,
  },
  {
    step: "05",
    title: "Kiểm Tra Trữ Cót & Bàn Giao",
    desc: "Kiểm tra khả năng tích cót tự động trong 48 - 72 giờ liên tục trên máy xoay mô phỏng trước khi gửi lại khách hàng.",
    icon: CheckCircle2,
  },
];

const FAQS = [
  {
    q: "Chính sách bảo hành tại Tempus có thời hạn bao lâu?",
    a: "Thời gian bảo hành mặc định dao động từ 2 đến 5 năm hoặc trọn đời, tùy thuộc vào giá trị sản phẩm và thương hiệu của chiếc đồng hồ bạn mua. Thông tin cụ thể được ghi trên thẻ bảo hành vàng đi kèm sản phẩm.",
  },
  {
    q: "Bảo hành vàng bao gồm những lỗi nào?",
    a: "Bảo hành vàng tại Tempus bao gồm tất cả các lỗi kỹ thuật về máy từ nhà sản xuất (như chạy nhanh/chậm vượt mức quy định, dừng chạy, lỗi lịch, lỗi kim). Ở gói Premium và Gold, chúng tôi còn hỗ trợ sửa chữa các lỗi do người dùng vô ý gây ra như nhiễm từ hoặc vào nước nhẹ.",
  },
  {
    q: "Quy trình gửi bảo dưỡng đồng hồ mất bao lâu?",
    a: "Thông thường, quy trình bảo dưỡng lau dầu toàn diện mất khoảng 5 đến 7 ngày làm việc để bảo đảm qua đủ bước kiểm tra chống nước và tích trữ cót nghiêm ngặt. Đối với việc căn chỉnh nhanh, kỹ thuật viên có thể xử lý trong vòng 30 - 60 phút trực tiếp tại showroom.",
  },
  {
    q: "Đồng hồ không mua tại Tempus có được bảo dưỡng không?",
    a: "Có, Tempus Service Center nhận sửa chữa và bảo dưỡng mọi mẫu đồng hồ cao cấp chính hãng từ các thương hiệu lớn. Khách hàng không mua tại cửa hàng sẽ thanh toán chi phí dịch vụ theo bảng giá tiêu chuẩn niêm yết tại trung tâm bảo hành.",
  },
];

export default function WarrantyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Banner / Header */}
      <section className="relative py-20 bg-dark-surface/30 border-b border-dark-border/20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/[0.03] rounded-full blur-[120px]" />
        
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-gold mb-2">
            <ShieldCheck size={12} className="text-gold" />
            <span className="text-[10px] font-semibold text-gold tracking-wider uppercase">Swiss Service Standards</span>
          </div>
          
          <h1 className="heading-serif text-4xl sm:text-5xl text-ivory">
            Chính Sách Bảo Hành Cao Cấp
          </h1>
          
          <p className="text-sm text-ivory/50 max-w-xl mx-auto leading-relaxed">
            Mỗi cỗ máy thời gian tại Tempus được bảo hộ bởi chính sách chăm sóc tối ưu nhất. 
            Cam kết sử dụng linh kiện chính hãng và công nghệ bảo dưỡng chuẩn Thụy Sĩ.
          </p>
          
          <div className="line-gold w-16 h-[2px] bg-gold mt-4 mx-auto" />
        </div>
      </section>

      {/* Packages Grid */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-semibold">Bảo hộ toàn diện</span>
          <h2 className="heading-serif text-2xl sm:text-3xl text-ivory mt-1">Các Gói Đặc Quyền Bảo Hành</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {WARRANTY_PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`p-6 sm:p-8 rounded-2xl border ${pkg.border} ${pkg.bg} flex flex-col justify-between relative overflow-hidden group hover:border-gold/40 transition-all duration-300`}
            >
              {pkg.tag && (
                <div className="absolute top-0 right-0 bg-gold text-dark-bg text-[9px] font-bold py-1 px-4 rounded-bl-lg uppercase tracking-wider">
                  {pkg.tag}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs tracking-widest text-gold font-bold font-mono">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold heading-serif text-ivory">{pkg.duration}</span>
                  </div>
                  <p className="text-[11px] text-ivory/40 mt-1 font-light">{pkg.target}</p>
                </div>
                
                <div className="h-[1px] bg-dark-border/20" />
                
                <ul className="space-y-3.5">
                  {pkg.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-ivory/60 leading-relaxed">
                      <CheckCircle2 size={14} className="text-gold shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-dark-surface/40 py-16 border-y border-dark-border/20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-semibold">Service Center</span>
            <h2 className="heading-serif text-2xl sm:text-3xl text-ivory mt-1">Quy Trình Bảo Dưỡng 5 Bước</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[1px] bg-dark-border/30 z-0" />
            
            {MAINTENANCE_STEPS.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-4 group">
                <div className="w-14 h-14 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-gold font-bold text-sm relative group-hover:border-gold/50 group-hover:bg-gold/5 transition-all duration-300">
                  <step.icon size={20} className="text-gold/80 group-hover:text-gold" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-dark-surface border border-dark-border text-[9px] text-ivory/40 flex items-center justify-center font-mono">
                    {step.step}
                  </span>
                </div>
                <div className="space-y-1 px-2">
                  <h4 className="text-xs font-semibold text-ivory/80 group-hover:text-gold transition-colors">{step.title}</h4>
                  <p className="text-[10px] text-ivory/30 leading-relaxed font-light">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-semibold">Giải đáp thắc mắc</span>
          <h2 className="heading-serif text-2xl sm:text-3xl text-ivory mt-1">Câu Hỏi Thường Gặp</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-dark-border/40 bg-dark-card/15 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs font-semibold text-ivory/80 hover:text-gold transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gold/60 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-[11px] text-ivory/40 leading-relaxed border-t border-dark-border/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
