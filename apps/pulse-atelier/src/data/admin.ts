import type { Coupon, InventoryMovement, Review, SupportTicket } from "@/types/domain";

export const inventoryMovements: InventoryMovement[] = [
  { id: "inv-001", productId: "prod-aura-watch-pro", type: "in", quantity: 24, reason: "Nhap dot launch", createdAt: "2026-05-01T02:00:00.000Z" },
  { id: "inv-002", productId: "prod-sonic-air-max", type: "out", quantity: 6, reason: "Don hang online", createdAt: "2026-05-03T08:20:00.000Z" },
  { id: "inv-003", productId: "prod-garmin-vital-x", type: "in", quantity: 12, reason: "Bo sung hang the thao", createdAt: "2026-05-04T03:15:00.000Z" },
  { id: "inv-004", productId: "prod-samsung-galaxy-tab-aura", type: "adjustment", quantity: -1, reason: "Mau trung bay", createdAt: "2026-05-07T09:00:00.000Z" },
  { id: "inv-005", productId: "prod-sony-focus-buds", type: "out", quantity: 4, reason: "Don doanh nghiep", createdAt: "2026-05-10T06:35:00.000Z" },
  { id: "inv-006", productId: "prod-fitbit-sense-lite", type: "in", quantity: 20, reason: "Nhap lai kho", createdAt: "2026-05-14T02:50:00.000Z" },
  { id: "inv-007", productId: "prod-pulse-charge-duo", type: "out", quantity: 10, reason: "Ban kem combo", createdAt: "2026-05-18T12:10:00.000Z" },
  { id: "inv-008", productId: "prod-atelier-magnetic-band", type: "in", quantity: 40, reason: "Day deo mau moi", createdAt: "2026-05-20T04:45:00.000Z" },
];

export const reviews: Review[] = [
  { id: "rev-001", productId: "prod-aura-watch-pro", customerId: "cust-minh-anh", rating: 5, content: "Pin tot va cam bien theo doi rat on dinh.", status: "published", createdAt: "2026-05-05T14:00:00.000Z" },
  { id: "rev-002", productId: "prod-sonic-air-max", customerId: "cust-tu-khoa", rating: 4, content: "Chong on tot, hop sac hoi de bam dau van tay.", status: "published", createdAt: "2026-05-13T09:12:00.000Z" },
  { id: "rev-003", productId: "prod-garmin-vital-x", customerId: "cust-quang-huy", rating: 5, content: "GPS nhanh, pin du cho chuyen trekking dai.", status: "published", createdAt: "2026-05-16T07:30:00.000Z" },
  { id: "rev-004", productId: "prod-samsung-galaxy-tab-aura", customerId: "cust-lan-chi", rating: 4, content: "Man hinh dep cho ghi chu va xem phim.", status: "pending", createdAt: "2026-05-17T10:00:00.000Z" },
  { id: "rev-005", productId: "prod-apple-watch-series-atelier", customerId: "cust-ha-linh", rating: 5, content: "Dong bo iPhone rat muot, day deo dep.", status: "published", createdAt: "2026-05-18T15:25:00.000Z" },
  { id: "rev-006", productId: "prod-sony-focus-buds", customerId: "cust-minh-anh", rating: 5, content: "Lam viec quan ca phe yen tinh hon nhieu.", status: "published", createdAt: "2026-05-20T11:11:00.000Z" },
  { id: "rev-007", productId: "prod-fitbit-sense-lite", customerId: "cust-lan-chi", rating: 4, content: "Nhe va de theo doi giac ngu.", status: "published", createdAt: "2026-05-22T08:18:00.000Z" },
  { id: "rev-008", productId: "prod-lenovo-tab-studio", customerId: "cust-quang-huy", rating: 3, content: "On cho hoc tap, loa can cai thien.", status: "hidden", createdAt: "2026-05-24T06:48:00.000Z" },
];

export const coupons: Coupon[] = [
  { id: "coupon-pulse10", code: "PULSE10", type: "percent", value: 10, usageCount: 38, usageLimit: 200, active: true, startsAt: "2026-05-01T00:00:00.000Z", endsAt: "2026-07-01T00:00:00.000Z" },
  { id: "coupon-focus500", code: "FOCUS500", type: "fixed", value: 500000, usageCount: 12, usageLimit: 80, active: true, startsAt: "2026-05-10T00:00:00.000Z", endsAt: "2026-06-30T00:00:00.000Z" },
  { id: "coupon-vip15", code: "VIP15", type: "percent", value: 15, usageCount: 9, usageLimit: 40, active: true, startsAt: "2026-05-15T00:00:00.000Z", endsAt: "2026-08-01T00:00:00.000Z" },
  { id: "coupon-student300", code: "STUDENT300", type: "fixed", value: 300000, usageCount: 24, usageLimit: 120, active: true, startsAt: "2026-05-01T00:00:00.000Z", endsAt: "2026-09-01T00:00:00.000Z" },
  { id: "coupon-launch20", code: "LAUNCH20", type: "percent", value: 20, usageCount: 100, usageLimit: 100, active: false, startsAt: "2026-04-01T00:00:00.000Z", endsAt: "2026-05-01T00:00:00.000Z" },
];

export const supportTickets: SupportTicket[] = [
  { id: "ticket-001", customerId: "cust-minh-anh", productId: "prod-aura-watch-pro", subject: "Can huong dan cai ECG", status: "in-progress", priority: "medium", assignedTo: "Nhi", createdAt: "2026-05-21T02:20:00.000Z" },
  { id: "ticket-002", customerId: "cust-quang-huy", productId: "prod-garmin-vital-x", subject: "Hoi ve dong bo Garmin Connect", status: "open", priority: "low", assignedTo: "Bao", createdAt: "2026-05-22T04:10:00.000Z" },
  { id: "ticket-003", customerId: "cust-lan-chi", productId: "prod-samsung-galaxy-tab-aura", subject: "Doi mau bao da tablet", status: "resolved", priority: "medium", assignedTo: "Nhi", createdAt: "2026-05-22T09:05:00.000Z" },
  { id: "ticket-004", customerId: "cust-tu-khoa", productId: "prod-sonic-air-max", subject: "Tai nghe ket noi chap chon", status: "open", priority: "high", assignedTo: "Minh", createdAt: "2026-05-23T11:25:00.000Z" },
  { id: "ticket-005", customerId: "cust-ha-linh", productId: "prod-atelier-magnetic-band", subject: "Tu van kich co day deo", status: "resolved", priority: "low", assignedTo: "Bao", createdAt: "2026-05-24T03:55:00.000Z" },
  { id: "ticket-006", customerId: "cust-minh-anh", subject: "Cap nhat dia chi giao hang", status: "in-progress", priority: "medium", assignedTo: "Nhi", createdAt: "2026-05-25T08:40:00.000Z" },
];
