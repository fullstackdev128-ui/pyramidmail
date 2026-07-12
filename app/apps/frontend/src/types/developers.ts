export type Permission = "read" | "send" | "delete" | "webhooks";

export interface ApiStats {
  totalRequests: number;
  requestsToday: number;
  activeKeys: number;
  successRate: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt: string;
  status: "active" | "revoked";
  permissions: Permission[];
  requestCount: number;
}

export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  category: "Messages" | "Auth" | "Contacts" | "Webhooks";
  auth: boolean;
  params: ApiParam[];
  responseExample: string;
}

export type EndpointCategory = "all" | "Messages" | "Auth" | "Contacts" | "Webhooks";
