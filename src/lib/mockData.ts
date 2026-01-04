import { User, Company, Project, Tag, BoardStatus, Board, Comment, Attachment } from './types';

// 사용자 데이터 (일반 사용자 제거, 관리자와 담당자만 유지)
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '김관리자',
    email: 'admin@company.com',
    role: 'admin',
    companyId: 'company-1',
    avatar: '👨‍💼',
    assignedProjectIds: ['project-1', 'project-2', 'project-3'] // 관리자는 모든 프로젝트 접근 가능
  },
  {
    id: 'user-2',
    name: '박담당자',
    email: 'manager@company.com',
    role: 'manager',
    companyId: 'company-1',
    avatar: '👩‍💻',
    assignedProjectIds: ['project-1'] // 박담당자는 '웹사이트 리뉴얼' 프로젝트만 담당
  },
  {
    id: 'user-4',
    name: '정개발자',
    email: 'dev@company.com',
    role: 'manager',
    companyId: 'company-2',
    avatar: '👨‍🔧',
    assignedProjectIds: ['project-3'] // 정개발자는 'ERP 시스템 구축' 프로젝트만 담당
  }
];

// 회사 데이터
export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'ABC 테크놀로지',
    code: 'ABC',
    projects: []
  },
  {
    id: 'company-2',
    name: 'XYZ 솔루션',
    code: 'XYZ',
    projects: []
  }
];

// 프로젝트 데이터
export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: '웹사이트 리뉴얼',
    code: 'WEB-001',
    companyId: 'company-1',
    description: '기업 웹사이트 전체 리뉴얼 프로젝트'
  },
  {
    id: 'project-2',
    name: '모바일 앱 개발',
    code: 'APP-001',
    companyId: 'company-1',
    description: 'iOS/Android 앱 개발 프로젝트'
  },
  {
    id: 'project-3',
    name: 'ERP 시스템 구축',
    code: 'ERP-001',
    companyId: 'company-2',
    description: '기업 자원 관리 시스템 구축'
  }
];

// 태그 데이터
export const mockTags: Tag[] = [
  {
    id: 'tag-1',
    name: '버그',
    code: 'BUG',
    projectId: 'project-1',
    color: '#ef4444'
  },
  {
    id: 'tag-2',
    name: '기능요청',
    code: 'FEATURE',
    projectId: 'project-1',
    color: '#3b82f6'
  },
  {
    id: 'tag-3',
    name: '개선',
    code: 'IMPROVE',
    projectId: 'project-2',
    color: '#10b981'
  },
  {
    id: 'tag-4',
    name: '긴급',
    code: 'URGENT',
    projectId: 'project-3',
    color: '#f59e0b'
  }
];

// 게시글 상태 데이터
export const mockStatuses: BoardStatus[] = [
  {
    id: 'status-1',
    name: '접수',
    code: 'received',
    color: '#6b7280',
    label: '접수됨'
  },
  {
    id: 'status-2',
    name: '확인',
    code: 'confirmed',
    color: '#3b82f6',
    label: '확인됨'
  },
  {
    id: 'status-3',
    name: '진행',
    code: 'in_progress',
    color: '#10b981',
    label: '진행중'
  },
  {
    id: 'status-4',
    name: '완료',
    code: 'completed',
    color: '#059669',
    label: '완료됨'
  },
  {
    id: 'status-5',
    name: '보류',
    code: 'hold',
    color: '#f59e0b',
    label: '보류됨'
  },
  {
    id: 'status-6',
    name: '취소',
    code: 'cancelled',
    color: '#ef4444',
    label: '취소됨'
  },
  {
    id: 'status-notice',
    name: '공지',
    code: 'notice',
    color: '#374151',
    label: '공지'
  }
];

// 첨부파일 데이터
export const mockAttachments: Attachment[] = [
  {
    id: 'file-1',
    filename: 'error_log_20240101.txt',
    originalName: '에러로그.txt',
    size: 245760,
    type: 'text/plain',
    url: '/uploads/error_log_20240101.txt',
    uploadedAt: '2024-01-01T10:30:00Z'
  },
  {
    id: 'file-2',
    filename: 'screenshot_bug.png',
    originalName: '버그스크린샷.png',
    size: 1048576,
    type: 'image/png',
    url: '/uploads/screenshot_bug.png',
    uploadedAt: '2024-01-01T10:35:00Z'
  },
  {
    id: 'file-3',
    filename: 'user_manual.pdf',
    originalName: '사용자매뉴얼.pdf',
    size: 2097152,
    type: 'application/pdf',
    url: '/uploads/user_manual.pdf',
    uploadedAt: '2024-01-02T14:20:00Z'
  }
];

// 댓글 데이터
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    boardId: 'board-1',
    content: '이 문제 확인했습니다. 빠른 시일 내에 수정하겠습니다.',
    author: mockUsers[1],
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z',
    isInternal: false
  },
  {
    id: 'comment-2',
    boardId: 'board-1',
    content: '@김관리자 개발팀에 전달했습니다. 내일까지 수정 예정입니다.',
    author: mockUsers[1],
    createdAt: '2024-01-01T11:30:00Z',
    updatedAt: '2024-01-01T11:30:00Z',
    isInternal: true,
    mentions: ['user-1']
  },
  {
    id: 'comment-3',
    boardId: 'board-2',
    content: '로그 파일 첨부했습니다. 확인 부탁드립니다.',
    author: mockUsers[1],
    createdAt: '2024-01-02T09:15:00Z',
    updatedAt: '2024-01-02T09:15:00Z',
    isInternal: false
  }
];

// 게시글 데이터 (총 6개 초기 설정)
export const mockBoards: Board[] = [
  {
    id: 'board-1',
    title: '[공지] 파일 업로드 정책 안내',
    content: `<p>안전한 운영을 위해 첨부파일 업로드 정책을 안내드립니다.</p>
<ul>
<li><strong>차단 파일:</strong> exe 등 실행파일/스크립트 계열은 업로드 불가</li>
<li><strong>권장 파일:</strong> 이미지(PNG/JPG), 문서(PDF), 텍스트(TXT) 등</li>
<li><strong>주의:</strong> 민감정보가 포함된 파일은 업로드하지 말아주세요</li>
</ul>
<p>정책은 추후 운영 기준에 따라 변경될 수 있습니다.</p>`,
    author: mockUsers[0], // 김관리자
    status: mockStatuses[6], // 공지 (mockStatuses[6]이 공지임)
    tags: [mockTags[1]],
    isSecret: false,
    isNotice: true,
    projectId: 'project-1',
    companyId: 'company-1',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
    viewCount: 10,
    comments: [],
    attachments: [],
    workHours: 0
  },
  {
    id: 'board-2',
    title: '박담당자 작성글 1 - 웹사이트 리뉴얼 요청',
    content: `<p>박담당자가 작성한 첫 번째 게시글입니다.</p>`,
    author: mockUsers[1], // 박담당자
    status: mockStatuses[0],
    tags: [mockTags[0]],
    isSecret: false,
    projectId: 'project-1',
    companyId: 'company-1',
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
    viewCount: 5,
    comments: [],
    attachments: [],
    workHours: 1.0
  },
  {
    id: 'board-3',
    title: '박담당자 작성글 2 - 모바일 앱 디자인 피드백',
    content: `<p>박담당자가 작성한 두 번째 게시글입니다.</p>`,
    author: mockUsers[1], // 박담당자
    status: mockStatuses[2],
    tags: [mockTags[2]],
    isSecret: false,
    projectId: 'project-2',
    companyId: 'company-1',
    createdAt: '2024-01-03T11:00:00Z',
    updatedAt: '2024-01-03T11:00:00Z',
    viewCount: 3,
    comments: [],
    attachments: [],
    workHours: 2.0
  },
  {
    id: 'board-4',
    title: '박담당자 작성글 3 - 시스템 보안 점검 요청',
    content: `<p>박담당자가 작성한 세 번째 게시글입니다.</p>`,
    author: mockUsers[1], // 박담당자
    status: mockStatuses[1],
    tags: [mockTags[3]],
    isSecret: true,
    projectId: 'project-3',
    companyId: 'company-1',
    createdAt: '2024-01-04T12:00:00Z',
    updatedAt: '2024-01-04T12:00:00Z',
    viewCount: 7,
    comments: [],
    attachments: [],
    workHours: 0.5
  },
  {
    id: 'board-5',
    title: '정개발자 작성글 1 - API 명세서 업데이트',
    content: `<p>정개발자가 작성한 첫 번째 게시글입니다.</p>`,
    author: mockUsers[2], // 정개발자
    status: mockStatuses[3],
    tags: [mockTags[1]],
    isSecret: false,
    projectId: 'project-3',
    companyId: 'company-2',
    createdAt: '2024-01-05T13:00:00Z',
    updatedAt: '2024-01-05T13:00:00Z',
    viewCount: 12,
    comments: [],
    attachments: [],
    workHours: 4.0
  },
  {
    id: 'board-6',
    title: '정개발자 작성글 2 - 데이터베이스 마이그레이션 계획',
    content: `<p>정개발자가 작성한 두 번째 게시글입니다.</p>`,
    author: mockUsers[2], // 정개발자
    status: mockStatuses[0],
    tags: [mockTags[0]],
    isSecret: false,
    projectId: 'project-3',
    companyId: 'company-2',
    createdAt: '2024-01-06T14:00:00Z',
    updatedAt: '2024-01-06T14:00:00Z',
    viewCount: 8,
    comments: [],
    attachments: [],
    workHours: 1.5
  }
];

// 무한스크롤 테스트를 위한 대량의 데이터 생성 (200개까지 채움)
if (mockBoards.length < 200) {
  const startCount = mockBoards.length;
  for (let i = startCount + 1; i <= 200; i++) {
    const randomUser = mockUsers[i % mockUsers.length];
    // '공지' 상태를 제외한 나머지 6개 상태 중에서만 랜덤 선택
    const randomStatus = mockStatuses[i % 6];
    const randomProject = mockProjects[i % mockProjects.length];
    const randomTag = mockTags[i % mockTags.length];

    // 최근 30일 이내의 날짜로 생성
    const date = new Date();
    date.setDate(date.getDate() - (i % 30));
    date.setHours(10, 0, 0, 0);
    const isoDate = date.toISOString();

    mockBoards.push({
      id: `board-gen-${i}`,
      title: `[테스트] ${randomProject.name} 관련 이슈 ${i}`,
      content: `<p>무한스크롤 테스트를 위해 자동 생성된 ${i}번째 게시글입니다.</p><p>내용은 샘플입니다.</p>`,
      author: randomUser,
      status: randomStatus,
      tags: [randomTag],
      isSecret: i % 15 === 0,
      projectId: randomProject.id,
      companyId: randomUser.companyId,
      createdAt: isoDate,
      updatedAt: isoDate,
      viewCount: Math.floor(Math.random() * 50),
      comments: [],
      attachments: []
    });
  }
}

// 헬퍼 함수들
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getCompanyById = (id: string): Company | undefined => {
  return mockCompanies.find(company => company.id === id);
};

export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const getBoardById = (id: string): Board | undefined => {
  return mockBoards.find(board => board.id === id);
};

export const getBoardsByProject = (projectId: string): Board[] => {
  return mockBoards.filter(board => board.projectId === projectId);
};

export const getBoardsByStatus = (statusCode: string): Board[] => {
  return mockBoards.filter(board => board.status.code === statusCode);
};

export const getPublicBoards = (): Board[] => {
  return mockBoards.filter(board => !board.isSecret);
};

export const getUserAccessibleBoards = (user: User): Board[] => {
  // 관리자는 모든 게시글 접근 가능
  if (user.role === 'admin') {
    return mockBoards;
  }

  // 일반 사용자는 공개 게시글 + 자신이 작성한 비밀게시글만 접근 가능
  return mockBoards.filter(board =>
    !board.isSecret || board.author.id === user.id
  );
};
