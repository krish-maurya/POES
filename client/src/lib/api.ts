// Centralized API client for the POES backend.
// Set VITE_API_BASE_URL in .env (e.g. an ngrok HTTPS URL) to point at your API.

const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:5078";

export const API_BASE = RAW_BASE.replace(/\/$/, "");
const TOKEN_KEY = "poes.auth.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function friendlyMessage(status: number, data: unknown): string {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const msg = (d.message ?? d.title ?? d.error) as string | undefined;
    if (msg) return msg;
    if (d.errors && typeof d.errors === "object") {
      const first = Object.values(d.errors as Record<string, unknown>)[0];
      if (Array.isArray(first) && first.length && typeof first[0] === "string")
        return first[0] as string;
    }
  }
  if (typeof data === "string" && data.trim()) return data;
  if (status === 400) return "Please check the information and try again.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find what you were looking for.";
  if (status >= 500) return "Something went wrong. Please try again.";
  return "Request failed. Please try again.";
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  auth?: boolean; // default true
  signal?: AbortSignal;
}

export async function api<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = opts;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    throw new ApiError(
      "Cannot reach the server. Check your connection and try again.",
      0,
      err,
    );
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) setToken(null);
    throw new ApiError(friendlyMessage(res.status, data), res.status, data);
  }

  return data as T;
}

type Packing = 0 | 1;

interface BackendSupplier {
  supplierCode: string;
  description: string;
  address?: string | null;
  zipCode?: string | null;
  town?: string | null;
  country?: string | null;
  phone?: string | null;
  fax?: string | null;
}

interface BackendItem {
  itemCode: string;
  description: string;
  variety?: string | null;
  packing: Packing;
  grossWeight: number;
  netWeight: number;
  supplierCode?: string | null;
  price: number;
  itemText?: string | null;
  inventoryOnHand: number;
  inventoryOnOrder: number;
  inventoryAllocated: number;
}

interface BackendPOHeader {
  orderNumber: string;
  supplierCode: string;
  orderDate: string;
  arrivalDate?: string | null;
  orderStatus: number | string;
}

interface BackendPOLine {
  orderNumber: string;
  position: number;
  itemCode: string;
  orderedQuantity: number;
  price: number;
}

interface BackendArrival {
  orderNumber: string;
  position: number;
  arrivedQuantity: number;
  arrivalDate: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactEmail?: string;
  email?: string;
  phone?: string;
  address?: string;
  town?: string;
  country?: string;
  zipCode?: string;
  fax?: string;
}

export interface Item {
  id: string;
  sku: string;
  itemSku: string;
  name: string;
  description: string;
  variety?: string;
  unitPrice: number;
  unitOfMeasure: string;
  packing: Packing;
  grossWeight: number;
  netWeight: number;
  supplierCode?: string;
  itemText?: string;
  quantityOnHand: number;
  quantityIncoming: number;
  quantityAllocated: number;
  quantityAvailable: number;
}

export interface POLine {
  id: string;
  orderNumber: string;
  position: number;
  itemSku: string;
  sku: string;
  description?: string;
  quantity: number;
  quantityReceived: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  number: string;
  supplierCode: string;
  supplierName?: string;
  companyName?: string;
  status: string;
  orderDate: string;
  expectedDate?: string;
  arrivalDate?: string;
  totalAmount: number;
  lines: POLine[];
  items: POLine[];
}

export interface Arrival {
  id: string;
  poNumber: string;
  poId: string;
  orderNumber: string;
  position: number;
  arrivalDate: string;
  notes?: string;
  lines: Array<{ itemSku: string; quantityReceived: number }>;
}

export interface InventoryRow extends Item {
  onHand: number;
  allocated: number;
  available: number;
  incoming: number;
}

function orderStatusName(status: number | string): string {
  if (typeof status === "string") return status;
  if (status === 1) return "OrderEntry";
  if (status === 2) return "OrderDelivery";
  if (status === 3) return "Delivered";
  return String(status);
}

function supplierFromDto(dto: BackendSupplier): Supplier {
  return {
    id: dto.supplierCode,
    code: dto.supplierCode,
    name: dto.description,
    phone: dto.phone ?? undefined,
    address: dto.address ?? undefined,
    town: dto.town ?? undefined,
    country: dto.country ?? undefined,
    zipCode: dto.zipCode ?? undefined,
    fax: dto.fax ?? undefined,
  };
}

function itemFromDto(dto: BackendItem): Item {
  const onHand = Number(dto.inventoryOnHand) || 0;
  const allocated = Number(dto.inventoryAllocated) || 0;
  return {
    id: dto.itemCode,
    sku: dto.itemCode,
    itemSku: dto.itemCode,
    name: dto.description,
    description: dto.itemText ?? dto.description,
    variety: dto.variety ?? undefined,
    unitPrice: dto.price,
    unitOfMeasure: dto.packing === 1 ? "packed" : "unit",
    packing: dto.packing,
    grossWeight: dto.grossWeight,
    netWeight: dto.netWeight,
    supplierCode: dto.supplierCode ?? undefined,
    itemText: dto.itemText ?? undefined,
    quantityOnHand: onHand,
    quantityIncoming: Number(dto.inventoryOnOrder) || 0,
    quantityAllocated: allocated,
    quantityAvailable: onHand - allocated,
  };
}

function lineFromDto(dto: BackendPOLine, item?: Item, arrivedQuantity = 0): POLine {
  return {
    id: `${dto.orderNumber}-${dto.position}`,
    orderNumber: dto.orderNumber,
    position: dto.position,
    itemSku: dto.itemCode,
    sku: dto.itemCode,
    description: item?.name,
    quantity: dto.orderedQuantity,
    quantityReceived: arrivedQuantity,
    unitPrice: dto.price,
  };
}

function supplierPayload(input: Partial<Supplier>) {
  return {
    description: input.name ?? "",
    address: input.address || undefined,
    zipCode: input.zipCode || undefined,
    town: input.town || undefined,
    country: input.country || undefined,
    phone: input.phone || undefined,
    fax: input.fax || undefined,
  };
}

function itemPayload(input: Partial<Item>) {
  const grossWeight = Number(input.grossWeight ?? 0);
  const netWeight = Number(input.netWeight ?? grossWeight);
  return {
    itemCode: input.sku?.toUpperCase() ?? "",
    description: input.name ?? input.description ?? "",
    variety: input.variety || undefined,
    packing: input.packing ?? (netWeight === grossWeight ? 0 : 1),
    grossWeight,
    netWeight,
    supplierCode: input.supplierCode?.toUpperCase() || undefined,
    price: Number(input.unitPrice) || 0,
    itemText: input.itemText ?? input.description ?? undefined,
  };
}

async function readLineArrival(line: BackendPOLine): Promise<BackendArrival | null> {
  try {
    return await api<BackendArrival>(
      `/api/purchaseorders/${line.orderNumber}/lines/${line.position}/arrivals`,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getSuppliers(): Promise<Supplier[]> {
  const rows = await api<BackendSupplier[]>("/api/suppliers");
  return rows.map(supplierFromDto);
}

export async function createSupplier(input: Partial<Supplier>) {
  return supplierFromDto(await api<BackendSupplier>("/api/suppliers", {
    method: "POST",
    body: supplierPayload(input),
  }));
}

export async function updateSupplier(code: string, input: Partial<Supplier>) {
  await api(`/api/suppliers/${code}`, {
    method: "PUT",
    body: supplierPayload(input),
  });
}

export async function deleteSupplier(code: string) {
  await api(`/api/suppliers/${code}`, { method: "DELETE" });
}

export async function getItems(): Promise<Item[]> {
  const rows = await api<BackendItem[]>("/api/items");
  return rows.map(itemFromDto);
}

export async function createItem(input: Partial<Item>) {
  return itemFromDto(await api<BackendItem>("/api/items", {
    method: "POST",
    body: itemPayload(input),
  }));
}

export async function updateItem(code: string, input: Partial<Item>) {
  const body = itemPayload(input);
  const { itemCode: _itemCode, ...updateBody } = body;
  await api(`/api/items/${code}`, { method: "PUT", body: updateBody });
}

export async function deleteItem(code: string) {
  await api(`/api/items/${code}`, { method: "DELETE" });
}

export async function getInventory(): Promise<InventoryRow[]> {
  const items = await getItems();
  return items.map((item) => ({
    ...item,
    onHand: item.quantityOnHand,
    allocated: item.quantityAllocated,
    available: item.quantityAvailable,
    incoming: item.quantityIncoming,
  }));
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const [headers, suppliers, items] = await Promise.all([
    api<BackendPOHeader[]>("/api/purchaseorders"),
    getSuppliers().catch(() => []),
    getItems().catch(() => []),
  ]);
  const supplierByCode = new Map(suppliers.map((s) => [s.code, s]));
  const itemByCode = new Map(items.map((item) => [item.sku, item]));

  return Promise.all(headers.map(async (header) => {
    const rawLines = await api<BackendPOLine[]>(
      `/api/purchaseorders/${header.orderNumber}/lines`,
    );
    const arrivals = await Promise.all(rawLines.map(readLineArrival));
    const lines = rawLines.map((line, index) =>
      lineFromDto(line, itemByCode.get(line.itemCode), arrivals[index]?.arrivedQuantity ?? 0),
    );
    const totalAmount = lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0,
    );
    return {
      id: header.orderNumber,
      poNumber: header.orderNumber,
      number: header.orderNumber,
      supplierCode: header.supplierCode,
      supplierName: supplierByCode.get(header.supplierCode)?.name,
      companyName: "Company",
      status: orderStatusName(header.orderStatus),
      orderDate: header.orderDate,
      expectedDate: header.arrivalDate ?? undefined,
      arrivalDate: header.arrivalDate ?? undefined,
      totalAmount,
      lines,
      items: lines,
    };
  }));
}

export async function createPurchaseOrder(input: {
  supplierCode: string;
  lines: Array<{ itemSku?: string; sku?: string; quantity?: number }>;
}) {
  const header = await api<BackendPOHeader>("/api/purchaseorders", {
    method: "POST",
    body: { supplierCode: input.supplierCode.toUpperCase() },
  });
  await Promise.all(input.lines.map((line) =>
    api(`/api/purchaseorders/${header.orderNumber}/lines`, {
      method: "POST",
      body: {
        itemCode: String(line.itemSku ?? line.sku ?? "").toUpperCase(),
        orderedQuantity: Number(line.quantity) || 0,
      },
    }),
  ));
  return header;
}

export async function getArrivals(): Promise<Arrival[]> {
  const orders = await getPurchaseOrders();
  return orders.flatMap((order) =>
    order.lines
      .filter((line) => line.quantityReceived > 0)
      .map((line) => ({
        id: `${order.poNumber}-${line.position}`,
        poNumber: order.poNumber,
        poId: order.poNumber,
        orderNumber: order.poNumber,
        position: line.position,
        arrivalDate: order.arrivalDate ?? order.orderDate,
        lines: [{ itemSku: line.itemSku, quantityReceived: line.quantityReceived }],
      })),
  );
}

export async function recordArrival(input: {
  orderNumber: string;
  position: number;
  arrivedQuantity: number;
  arrivalDate: string;
}) {
  return api<BackendArrival>(
    `/api/purchaseorders/${input.orderNumber}/lines/${input.position}/arrivals`,
    {
      method: "POST",
      body: {
        orderNumber: input.orderNumber,
        position: input.position,
        arrivedQuantity: input.arrivedQuantity,
        arrivalDate: input.arrivalDate,
      },
    },
  );
}
