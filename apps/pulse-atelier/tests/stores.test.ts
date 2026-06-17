import { beforeEach, describe, expect, it } from "vitest";
import { coupons, reviews, supportTickets } from "@/data/admin";
import { orders } from "@/data/orders";
import { products } from "@/data/products";
import { useAdminStore } from "@/stores/admin-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { canAddToCompare, useCompareStore } from "@/stores/compare-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useOrderStore } from "@/stores/order-store";
import type { Order } from "@/types/domain";
import { db } from "@/lib/db";

describe("client stores", () => {
  beforeEach(async () => {
    useCartStore.getState().clear();
    useWishlistStore.getState().clear();
    useCompareStore.getState().clear();
    useAuthStore.getState().resetRegisteredAccounts();
    useAuthStore.getState().logout();
    useAdminStore.getState().reset();
    useOrderStore.getState().clearOrders();

    // Clean up test registrations from DB
    await db.account.deleteMany({ where: { email: "moi@example.com" } }).catch(() => {});
    await db.customer.deleteMany({ where: { email: "moi@example.com" } }).catch(() => {});
  });

  it("adds, merges, updates, removes, and clears cart items", () => {
    const cart = useCartStore.getState();

    cart.add("prod-aura-watch-pro", 1);
    cart.add("prod-aura-watch-pro", 2);
    cart.add("prod-pulse-charge-duo", 1);

    expect(useCartStore.getState().items).toEqual([
      { productId: "prod-aura-watch-pro", quantity: 3 },
      { productId: "prod-pulse-charge-duo", quantity: 1 },
    ]);

    useCartStore.getState().setQuantity("prod-aura-watch-pro", 1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);

    useCartStore.getState().remove("prod-pulse-charge-duo");
    expect(useCartStore.getState().items).toHaveLength(1);

    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("clamps cart quantities to whole numbers between one and nine", () => {
    const cart = useCartStore.getState();

    cart.add("prod-aura-watch-pro", 1.8);
    expect(useCartStore.getState().items[0].quantity).toBe(1);

    cart.add("prod-aura-watch-pro", 20);
    expect(useCartStore.getState().items[0].quantity).toBe(9);

    cart.setQuantity("prod-aura-watch-pro", 4.9);
    expect(useCartStore.getState().items[0].quantity).toBe(4);

    cart.setQuantity("prod-aura-watch-pro", -2);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it("toggles wishlist products and reports membership", () => {
    const wishlist = useWishlistStore.getState();

    wishlist.toggle("prod-aura-watch-pro");
    expect(useWishlistStore.getState().has("prod-aura-watch-pro")).toBe(true);

    wishlist.toggle("prod-aura-watch-pro");
    expect(useWishlistStore.getState().has("prod-aura-watch-pro")).toBe(false);
  });

  it("limits compare selections to four unique products", () => {
    expect(canAddToCompare([], "prod-aura-watch-pro")).toBe(true);
    expect(canAddToCompare(["prod-aura-watch-pro"], "prod-aura-watch-pro")).toBe(false);
    expect(
      canAddToCompare(
        ["prod-aura-watch-pro", "prod-sonic-air-max", "prod-garmin-vital-x", "prod-sony-focus-buds"],
        "prod-fitbit-sense-lite",
      ),
    ).toBe(false);

    const compare = useCompareStore.getState();
    expect(compare.add("prod-aura-watch-pro")).toBe(true);
    expect(compare.add("prod-sonic-air-max")).toBe(true);
    expect(compare.add("prod-garmin-vital-x")).toBe(true);
    expect(compare.add("prod-sony-focus-buds")).toBe(true);
    expect(compare.add("prod-aura-watch-pro")).toBe(false);
    expect(compare.add("prod-fitbit-sense-lite")).toBe(false);

    expect(useCompareStore.getState().productIds).toEqual([
      "prod-aura-watch-pro",
      "prod-sonic-air-max",
      "prod-garmin-vital-x",
      "prod-sony-focus-buds",
    ]);
  });

  it("tracks real frontend auth state", async () => {
    const auth = useAuthStore.getState();

    expect(auth.role).toBe("guest");
    expect(auth.user).toBeNull();

    expect(await auth.login("user@pulse.vn", "wrong")).toEqual({
      ok: false,
      error: "Email hoặc mật khẩu không đúng.",
    });

    const userLogin = await useAuthStore.getState().login("user@pulse.vn", "123456");
    expect(userLogin.ok).toBe(true);
    expect(useAuthStore.getState().role).toBe("user");
    expect(useAuthStore.getState().user?.customerId).toBe("cust-minh-anh");

    await useAuthStore.getState().login("admin@pulse.vn", "admin123");
    expect(useAuthStore.getState().role).toBe("admin");

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().role).toBe("guest");
  });

  it("registers, updates, deletes, and authenticates registered user accounts", async () => {
    const registerResult = await useAuthStore.getState().register({
      name: "Nguyen Van Moi",
      email: "moi@example.com",
      phone: "0909009009",
      address: "7 Le Loi, TP HCM",
      password: "123456",
    });

    expect(registerResult.ok).toBe(true);
    expect(useAuthStore.getState().role).toBe("user");
    expect(useAuthStore.getState().user).toMatchObject({
      email: "moi@example.com",
      name: "Nguyen Van Moi",
      phone: "0909009009",
      address: "7 Le Loi, TP HCM",
    });

    expect(await useAuthStore.getState().register({
      name: "Duplicate",
      email: "moi@example.com",
      phone: "",
      address: "",
      password: "123456",
    })).toEqual({ ok: false, error: "Email này đã được sử dụng." });

    useAuthStore.getState().logout();
    const loginResult = await useAuthStore.getState().login("moi@example.com", "123456");
    expect(loginResult.ok).toBe(true);

    const accountId = useAuthStore.getState().registeredAccounts[0].id;
    useAuthStore.getState().updateRegisteredAccount(accountId, {
      name: "Nguoi Dung Moi",
      phone: "0911111111",
    });
    expect(useAuthStore.getState().registeredAccounts[0]).toMatchObject({
      name: "Nguoi Dung Moi",
      phone: "0911111111",
    });

    useAuthStore.getState().deleteRegisteredAccount(accountId);
    expect(useAuthStore.getState().registeredAccounts).toEqual([]);

    // Also delete from DB so the database-backed login fails as expected
    await db.account.deleteMany({ where: { email: "moi@example.com" } }).catch(() => {});
    await db.customer.deleteMany({ where: { email: "moi@example.com" } }).catch(() => {});

    expect(await useAuthStore.getState().login("moi@example.com", "123456")).toEqual({
      ok: false,
      error: "Email hoặc mật khẩu không đúng.",
    });
  });

  it("creates registered user accounts for admin management without switching session", async () => {
    await useAuthStore.getState().login("admin@pulse.vn", "admin123");

    const result = useAuthStore.getState().createRegisteredAccount({
      name: "Managed User",
      email: "managed@example.com",
      phone: "0900000001",
      address: "9 Admin Street",
      password: "123456",
    });

    expect(result.ok).toBe(true);
    expect(useAuthStore.getState().role).toBe("admin");
    expect(useAuthStore.getState().user?.email).toBe("admin@pulse.vn");
    expect(useAuthStore.getState().registeredAccounts[0]).toMatchObject({
      email: "managed@example.com",
      role: "user",
    });
  });

  it("updates admin entities without mutating source data", () => {
    const admin = useAdminStore.getState();
    const originalProduct = structuredClone(products.find((product) => product.id === "prod-aura-watch-pro"));
    const originalOrder = structuredClone(orders.find((order) => order.id === "order-1006"));
    const originalReview = structuredClone(reviews.find((review) => review.id === "rev-004"));
    const originalTicket = structuredClone(supportTickets.find((ticket) => ticket.id === "ticket-002"));
    const originalCoupon = structuredClone(coupons.find((coupon) => coupon.id === "coupon-pulse10"));

    admin.updateProductStatus("prod-aura-watch-pro", "draft");
    admin.updateProductStock("prod-sonic-air-max", 4);
    admin.updateProductBadges("prod-aura-watch-pro", ["New", "Limited"]);
    admin.updateOrderStatus("order-1006", "confirmed");
    admin.updateReviewStatus("rev-004", "published");
    admin.updateTicketStatus("ticket-002", "resolved");
    admin.toggleCoupon("coupon-pulse10");

    const state = useAdminStore.getState();
    expect(state.products.find((product) => product.id === "prod-aura-watch-pro")?.status).toBe("draft");
    expect(state.products.find((product) => product.id === "prod-aura-watch-pro")?.badges).toEqual(["New", "Limited"]);
    expect(state.products.find((product) => product.id === "prod-sonic-air-max")?.stock).toBe(4);
    expect(state.orders.find((order) => order.id === "order-1006")?.status).toBe("confirmed");
    expect(state.reviews.find((review) => review.id === "rev-004")?.status).toBe("published");
    expect(state.tickets.find((ticket) => ticket.id === "ticket-002")?.status).toBe("resolved");
    expect(state.coupons.find((coupon) => coupon.id === "coupon-pulse10")?.active).toBe(false);

    expect(products.find((product) => product.id === "prod-aura-watch-pro")).toEqual(originalProduct);
    expect(orders.find((order) => order.id === "order-1006")).toEqual(originalOrder);
    expect(reviews.find((review) => review.id === "rev-004")).toEqual(originalReview);
    expect(supportTickets.find((ticket) => ticket.id === "ticket-002")).toEqual(originalTicket);
    expect(coupons.find((coupon) => coupon.id === "coupon-pulse10")).toEqual(originalCoupon);

    state.reset();
    expect(useAdminStore.getState().products.find((product) => product.id === "prod-aura-watch-pro")?.status).toBe("active");
  });

  it("synchronizes orders between order store and admin store", () => {
    const adminStore = useAdminStore.getState();
    const orderStore = useOrderStore.getState();

    // Verify initial state
    expect(orderStore.orders).toEqual([]);
    const initialAdminOrderCount = adminStore.orders.length;

    // Simulate placing a storefront order
    const mockOrder: Order = {
      id: "order-pa-20260617-9999",
      orderNumber: "PA-20260617-9999",
      customerId: "cust-minh-anh",
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "cod",
      items: [{ productId: "prod-aura-watch-pro", quantity: 1, unitPrice: 5990000 }],
      shippingAddress: "123 Test Street",
      note: "Test order",
      createdAt: new Date().toISOString(),
      subtotal: 5990000,
      discount: 0,
      shippingFee: 45000,
      total: 6035000,
    };

    // Customer places order, both addOrder are called (just like in CheckoutForm.tsx)
    useOrderStore.getState().addOrder(mockOrder);
    useAdminStore.getState().addOrder(mockOrder);

    expect(useOrderStore.getState().orders).toHaveLength(1);
    expect(useOrderStore.getState().orders[0].id).toBe(mockOrder.id);
    expect(useAdminStore.getState().orders).toHaveLength(initialAdminOrderCount + 1);
    expect(useAdminStore.getState().orders[0].id).toBe(mockOrder.id);

    // Admin updates order status (just like in admin/don-hang/page.tsx)
    useAdminStore.getState().updateOrder(mockOrder.id, { status: "confirmed" });
    useOrderStore.getState().updateOrder(mockOrder.id, { status: "confirmed" });

    expect(useOrderStore.getState().orders[0].status).toBe("confirmed");
    expect(useAdminStore.getState().orders[0].status).toBe("confirmed");

    // Admin deletes order (just like in admin/don-hang/page.tsx)
    useAdminStore.getState().deleteOrder(mockOrder.id);
    useOrderStore.getState().deleteOrder(mockOrder.id);

    expect(useOrderStore.getState().orders).toHaveLength(0);
    expect(useAdminStore.getState().orders).toHaveLength(initialAdminOrderCount);
  });

  it("synchronizes customers and accounts between auth store and admin store", () => {
    const adminStore = useAdminStore.getState();
    const authStore = useAuthStore.getState();

    const initialCustomersCount = adminStore.customers.length;
    const initialAccountsCount = authStore.registeredAccounts.length;

    // Simulate Admin manually creating a user account
    const createResult = useAuthStore.getState().createRegisteredAccount({
      name: "Moi User",
      email: "moi2@example.com",
      phone: "0999999999",
      address: "Address 1",
      password: "password123",
    });

    expect(createResult.ok).toBe(true);
    expect(useAuthStore.getState().registeredAccounts).toHaveLength(initialAccountsCount + 1);
    expect(useAdminStore.getState().customers).toHaveLength(initialCustomersCount + 1);

    const createdAccount = useAuthStore.getState().registeredAccounts[0];
    const createdCustomer = useAdminStore.getState().customers[0];
    expect(createdAccount.email).toBe("moi2@example.com");
    expect(createdCustomer.email).toBe("moi2@example.com");
    expect(createdAccount.customerId).toBe(createdCustomer.id);

    // Simulate Admin editing a customer
    useAdminStore.getState().updateCustomer(createdCustomer.id, {
      name: "Moi User Updated",
      phone: "0888888888",
    });
    useAuthStore.getState().updateRegisteredAccount(createdAccount.id, {
      name: "Moi User Updated",
      phone: "0888888888",
    });

    expect(useAdminStore.getState().customers[0].name).toBe("Moi User Updated");
    expect(useAuthStore.getState().registeredAccounts[0].name).toBe("Moi User Updated");

    // Simulate Admin deleting a customer
    useAdminStore.getState().deleteCustomer(createdCustomer.id);
    useAuthStore.getState().deleteRegisteredAccount(createdAccount.id);

    expect(useAdminStore.getState().customers).toHaveLength(initialCustomersCount);
    expect(useAuthStore.getState().registeredAccounts).toHaveLength(initialAccountsCount);
  });
});
