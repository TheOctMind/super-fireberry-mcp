/**
 * Fireberry CRM API Types
 */

export interface FireberryResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ObjectMetadata {
  objectTypeCode: number;
  name: string;
  systemname: string;
  logicalName: string;
  primarykeyname: string;
}

export interface FieldMetadata {
  fieldid: string;
  fieldname: string;
  label: string;
  isrequired: number;
  isreadonly: boolean;
}

export interface QueryRequest {
  pageNumber?: number;
  pageSize?: number;
  filter?: string | object;
  orderby?: string;
  fields?: string[];
}

export interface QueryResponse {
  Total_Records: number;
  Records: any[];
  IsLastPage: boolean;
}
