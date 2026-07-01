export enum PackingType {
  No = 0,
  Yes = 1,
}

export enum OrderStatus {
  OrderEntry = 1,
  OrderDelivery = 2,
  Delivered = 3,
}

export type UserRole = 'Admin' | 'Company' | 'Supplier';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role: 'Company' | 'Supplier';
  supplierCode?: string | null;
}

export interface LoginResponse {
  token: string;
  roles: string[];
}

export interface RegisterResponse {
  message: string;
  role: string;
}

export interface ItemCreateDto {
  itemCode: string;
  description: string;
  variety?: string | null;
  packing: PackingType;
  grossWeight: number;
  netWeight: number;
  supplierCode?: string | null;
  price: number;
  itemText?: string | null;
}

export interface ItemUpdateDto {
  description: string;
  variety?: string | null;
  packing: PackingType;
  grossWeight: number;
  netWeight: number;
  supplierCode?: string | null;
  price: number;
  itemText?: string | null;
}

export interface ItemReadDto {
  itemCode: string;
  description: string;
  variety?: string | null;
  packing: PackingType;
  grossWeight: number;
  netWeight: number;
  supplierCode?: string | null;
  price: number;
  itemText?: string | null;
  inventoryOnHand: number;
  inventoryOnOrder: number;
  inventoryAllocated: number;
}

export interface SupplierCreateDto {
  description: string;
  address?: string | null;
  zipCode?: string | null;
  town?: string | null;
  country?: string | null;
  phone?: string | null;
  fax?: string | null;
}

export interface SupplierUpdateDto {
  description: string;
  address?: string | null;
  zipCode?: string | null;
  town?: string | null;
  country?: string | null;
  phone?: string | null;
  fax?: string | null;
}

export interface SupplierReadDto {
  supplierCode: string;
  description: string;
  address?: string | null;
  zipCode?: string | null;
  town?: string | null;
  country?: string | null;
  phone?: string | null;
  fax?: string | null;
}

export interface ParameterCreateDto {
  numberGroupSupplier?: string | null;
  numberGroupPurchaseOrder?: string | null;
  createdByLogin: string;
}

export interface ParameterUpdateDto {
  numberGroupSupplier?: string | null;
  numberGroupPurchaseOrder?: string | null;
}

export interface ParameterReadDto {
  seqNo: number;
  numberGroupSupplier?: string | null;
  numberGroupPurchaseOrder?: string | null;
  createdByLogin: string;
  creationDate: string;
  modifiedByLogin?: string | null;
  modificationDate?: string | null;
}

export interface FirstFreeNumberCreateDto {
  numberGroup: string;
  description: string;
  firstFreeNo?: number;
}

export interface FirstFreeNumberReadDto {
  numberGroup: string;
  description: string;
  firstFreeNo: number;
}

export interface POHeaderCreateDto {
  supplierCode: string;
}

export interface POHeaderUpdateDto {
  supplierCode: string;
}

export interface POHeaderReadDto {
  orderNumber: string;
  supplierCode: string;
  orderDate: string;
  arrivalDate?: string | null;
  orderStatus: OrderStatus;
}

export interface POLineCreateDto {
  itemCode: string;
  orderedQuantity: number;
}

export interface POLineUpdateDto {
  orderedQuantity: number;
  price: number;
}

export interface POLineReadDto {
  orderNumber: string;
  position: number;
  itemCode: string;
  orderedQuantity: number;
  price: number;
}

export interface ArrivalCreateDto {
  orderNumber: string;
  position: number;
  arrivedQuantity: number;
  arrivalDate?: string | null;
}

export interface ArrivalUpdateDto {
  arrivedQuantity: number;
  arrivalDate: string;
}

export interface ArrivalReadDto {
  orderNumber: string;
  position: number;
  arrivedQuantity: number;
  arrivalDate: string;
}

export interface PendingQuantityResponse {
  pendingQuantity: number;
}

export interface ValidationProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  error?: string;
}

export interface IdentityError {
  code: string;
  description: string;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: UserRole[];
  supplierCode?: string | null;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
}
