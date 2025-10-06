// src/api/documentTokens.ts
import api from "./http";

export interface CreateTokenRequest {
  documentId?: number;
  expiration?: string | null;
}

export const documentTokensApi = {
  validate: (token: string) => api.get(`/document-tokens/${token}`),
  create: (payload: CreateTokenRequest) => api.post("/document-tokens", payload),
  revoke: (id: number) => api.delete(`/document-tokens/${id}`),
};
