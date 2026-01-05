// 게시판 관련 타입 정의

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  companyId: string;
  avatar?: string;
  assignedProjectIds?: string[]; // 담당자가 맡은 프로젝트 ID들
}

export interface Company {
  id: string;
  name: string;
  code: string;
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
  companyId: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  code: string;
  projectId: string;
  color: string;
}

export interface BoardStatus {
  id: string;
  name: string;
  code: 'received' | 'confirmed' | 'in_progress' | 'completed' | 'hold' | 'cancelled' | 'notice';
  color: string;
  label: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  boardId: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  isInternal: boolean; // 내부 메모인지 여부
  mentions?: string[]; // 멘션된 사용자 ID들
}

export interface Board {
  id: string;
  title: string;
  content: string;
  author: User;
  status: BoardStatus;
  tags: Tag[];
  isSecret: boolean; // 비밀게시글 여부
  isNotice?: boolean; // 공지사항(상단 고정) 여부
  projectId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  comments: Comment[];
  attachments: Attachment[];
  workHours?: number; // 작업 공수 (관리자용)
}

export interface BoardFilter {
  status?: string;
  projectId?: string;
  companyId?: string;
  authorId?: string;
  isSecret?: boolean;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BoardListResponse {
  boards: Board[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 검색 결과 타입
export interface SearchResult {
  boards: Board[];
  comments: Comment[];
  totalCount: number;
}
