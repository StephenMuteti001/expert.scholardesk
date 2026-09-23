export interface PortalUser {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  subscription_level?: string;
  role: string;
  avatar?: string | null;
}

export interface OrderClient {
  id?: string | number | undefined;
  name?: string | undefined;
  avatar?: string | undefined;
  country?: string;
}

export interface Order {
  id: string;
  title: string;
  subject?: string;
  type?: string;
  pages?: number;
  words?: number;
  deadline?: string;
  budget?: number;
  currency?: string;
  status: string;
  assignment_status?: string;
  assigned_at?: string;
  assigned_by?: string;
  instructions?: string;
  description?: string;
  academic_level?: string;
  citation_style?: string;
  sources?: number;
  progress?: number;
  client?: OrderClient;
  files?: OrderFile[];
  created_at?: string;
}

export interface OrderFile {
  id: string;
  name?: string;
  file_name?: string;
  size?: number;
  url?: string;
  uploaded_at?: string;
}

export interface ChatSummary {
  id: string;
  subject: string;
  orderReference?: string | null;
  status: "open" | "pending" | "resolved" | "archived";
  agentName: string;
  unread: number;
  updatedAt: string;
  lastMessage: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  author: "customer" | "expert" | "support";
  authorName: string;
  body: string;
  sentAt: string;
}

export interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  description?: string;
  status: string;
  order_id?: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  type?: string;
  is_read?: boolean;
  seen?: boolean;
  created_at: string;
  order_id?: string | null;
}
