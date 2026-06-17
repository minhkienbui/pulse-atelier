import crypto from "crypto";

type VnpayPrimitive = string | number;

export interface VnpayPaymentInput {
  orderNumber: string;
  amount: number;
  transactionRef: string;
  ipAddress?: string;
  locale?: "vn" | "en";
}

export interface VnpayConfig {
  tmnCode: string;
  hashSecret: string;
  paymentUrl: string;
  returnUrl: string;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for VNPAY integration.`);
  }
  return value;
}

export function getVnpayConfig(): VnpayConfig {
  return {
    tmnCode: requireEnv("VNPAY_TMN_CODE"),
    hashSecret: requireEnv("VNPAY_HASH_SECRET"),
    paymentUrl:
      process.env.VNPAY_PAYMENT_URL ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl:
      process.env.VNPAY_RETURN_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100"}/thanh-toan/ket-qua`,
  };
}

function formatVnpayDate(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function normalizeParams(params: Record<string, VnpayPrimitive>) {
  return Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right))
    .reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {});
}

function buildQuery(params: Record<string, string>) {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value).replace(
          /%20/g,
          "+"
        )}`
    )
    .join("&");
}

function signParams(params: Record<string, string>, hashSecret: string) {
  const signData = buildQuery(params);
  return crypto
    .createHmac("sha512", hashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

export function createVnpayPaymentUrl(input: VnpayPaymentInput) {
  const config = getVnpayConfig();
  const params = normalizeParams({
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: Math.round(input.amount) * 100,
    vnp_CurrCode: "VND",
    vnp_TxnRef: input.transactionRef,
    vnp_OrderInfo: `Thanh toan don hang ${input.orderNumber}`,
    vnp_OrderType: "other",
    vnp_Locale: input.locale || "vn",
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: input.ipAddress || "127.0.0.1",
    vnp_CreateDate: formatVnpayDate(new Date()),
  });
  const secureHash = signParams(params, config.hashSecret);
  const query = buildQuery({
    ...params,
    vnp_SecureHash: secureHash,
  });
  return `${config.paymentUrl}?${query}`;
}

function paramsToRecord(params: URLSearchParams) {
  const record: Record<string, string> = {};
  params.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export function verifyVnpaySignature(params: URLSearchParams) {
  const config = getVnpayConfig();
  const record = paramsToRecord(params);
  const receivedHash = record.vnp_SecureHash;

  delete record.vnp_SecureHash;
  delete record.vnp_SecureHashType;

  if (!receivedHash) return false;

  const signedParams = normalizeParams(record);
  const expectedHash = signParams(signedParams, config.hashSecret);
  const received = Buffer.from(receivedHash, "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
}

export function vnpayParamsToObject(params: URLSearchParams) {
  return paramsToRecord(params);
}
