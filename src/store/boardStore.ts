import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Attachment, Board, BoardFilter, Tag, User } from '@/lib/types';
import {
  mockBoards,
  mockUsers,
  mockStatuses,
  mockTags,
  getUserById,
  getUserAccessibleBoards,
  getBoardsByStatus,
  getBoardsByProject
} from '@/lib/mockData';

interface BoardState {
  // 데이터
  boards: Board[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;

  // 필터링
  filter: BoardFilter;
  searchQuery: string;

  // 액션
  setCurrentUser: (user: User | null) => void;
  loadBoards: () => void;
  setFilter: (filter: BoardFilter) => void;
  setSearchQuery: (query: string) => void;
  getFilteredBoards: () => Board[];
  getBoardById: (id: string) => Board | undefined;
  updateBoardStatus: (boardId: string, statusId: string) => void;
  updateBoardWorkHours: (boardId: string, hours: number) => void;
  addComment: (boardId: string, content: string, isInternal?: boolean) => void;
  updateComment: (boardId: string, commentId: string, content: string) => void;
  deleteComment: (boardId: string, commentId: string) => void;
  incrementViewCount: (boardId: string) => void;
  addBoard: (data: {
    title: string;
    contentHtml: string;
    contentPlain: string;
    projectId: string;
    isSecret: boolean;
    tagIds: string[];
    attachments: Array<Pick<Attachment, 'originalName' | 'size' | 'type'>>;
  }) => string | null;
  clearError: () => void;
}

export const useBoardStore = create<BoardState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        boards: [],
        currentUser: null,
        loading: false,
        error: null,
        filter: {},
        searchQuery: '',

        // 액션들
        setCurrentUser: (user) => set({ currentUser: user }),

        loadBoards: () => {
          set({ loading: true, error: null });
          try {
            set({
              boards: mockBoards,
              loading: false
            });
          } catch (error) {
            set({
              error: '게시글을 불러오는데 실패했습니다.',
              loading: false
            });
          }
        },

        setFilter: (filter) => set({ filter }),

        setSearchQuery: (query) => set({ searchQuery: query }),

        getFilteredBoards: () => {
          const { boards, filter, searchQuery, currentUser } = get();
          
          // 권한에 따른 기본 필터링 (김관리자는 전체, 담당자는 본인이 작성한 글만)
          let accessibleBoards = boards;
          if (currentUser) {
            if (currentUser.role === 'admin') {
              // 김관리자(admin): 모든 게시물 조회
              accessibleBoards = boards;
            } else {
              // 박담당자/정개발자(manager): 자기가 작성한 글 + 공지사항 조회
              accessibleBoards = boards.filter(board => 
                board.author.id === currentUser.id || board.status.code === 'notice'
              );
            }
          } else {
            // 비로그인 시 (예외 처리)
            accessibleBoards = boards.filter(board => !board.isSecret);
          }

          let filteredBoards = [...accessibleBoards];

          // 상태 필터링
          if (filter.status) {
            filteredBoards = filteredBoards.filter(board =>
              board.status.code === filter.status
            );
          }

          // 프로젝트 필터링
          if (filter.projectId) {
            filteredBoards = filteredBoards.filter(board =>
              board.projectId === filter.projectId
            );
          }

          // 회사 필터링
          if (filter.companyId) {
            filteredBoards = filteredBoards.filter(board =>
              board.companyId === filter.companyId
            );
          }

          // 작성자 필터링
          if (filter.authorId) {
            filteredBoards = filteredBoards.filter(board =>
              board.author.id === filter.authorId
            );
          }

          // 비밀게시글 필터링
          if (filter.isSecret !== undefined) {
            filteredBoards = filteredBoards.filter(board =>
              board.isSecret === filter.isSecret
            );
          }

          // 날짜 필터링
          if (filter.dateFrom) {
            const fromDate = parseDateStart(filter.dateFrom);
            filteredBoards = filteredBoards.filter(board =>
              new Date(board.createdAt) >= fromDate
            );
          }

          if (filter.dateTo) {
            const toDate = parseDateEnd(filter.dateTo);
            filteredBoards = filteredBoards.filter(board =>
              new Date(board.createdAt) <= toDate
            );
          }

          // 검색어 필터링
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filteredBoards = filteredBoards.filter(board => {
              const titleMatch = board.title.toLowerCase().includes(query);
              const contentMatch = board.content.toLowerCase().includes(query);
              const authorMatch = board.author.name.toLowerCase().includes(query);
              const tagMatch = board.tags.some(tag => tag.name.toLowerCase().includes(query));
              const commentMatch = board.comments.some(comment => {
                const commentContentMatch = comment.content.toLowerCase().includes(query);
                const commentAuthorMatch = comment.author.name.toLowerCase().includes(query);
                return commentContentMatch || commentAuthorMatch;
              });

              return titleMatch || contentMatch || authorMatch || tagMatch || commentMatch;
            });
          }

          // 정렬 로직: 모든 게시글을 최신순으로 정렬 (공지사항 상단 고정 해제)
          filteredBoards.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          return filteredBoards;
        },

        getBoardById: (id) => {
          return get().boards.find(board => board.id === id);
        },

        updateBoardStatus: (boardId, statusId) => {
          const newStatus = mockStatuses.find((s) => s.id === statusId);
          if (!newStatus) return;

          // 원본 목데이터 갱신 로직은 메모리 공유를 위해 유지 (선택사항)
          const target = mockBoards.find((b) => b.id === boardId);
          if (target) {
            target.status = newStatus;
            target.updatedAt = new Date().toISOString();
          }

          set((state) => ({
            boards: state.boards.map((board) =>
              board.id === boardId
                ? { ...board, status: newStatus, updatedAt: new Date().toISOString() }
                : board
            )
          }));
        },

        updateBoardWorkHours: (boardId, hours) => {
          set((state) => ({
            boards: state.boards.map(board =>
              board.id === boardId
                ? { ...board, workHours: hours }
                : board
            )
          }));
        },

        addComment: (boardId, content, isInternal = false) => {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          const newComment = {
            id: `comment-${Date.now()}`,
            boardId,
            content,
            author: currentUser,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isInternal,
            mentions: []
          };

          set((state) => {
            const nextBoards = state.boards.map(board =>
              board.id === boardId
                ? {
                    ...board,
                    comments: [...board.comments, newComment],
                    updatedAt: new Date().toISOString()
                  }
                : board
            );

            // 상태 업데이트 후, 변경된 게시글 정보를 mockBoards(원본)에도 동기화
            const updatedBoard = nextBoards.find(b => b.id === boardId);
            const targetIdx = mockBoards.findIndex(b => b.id === boardId);
            if (updatedBoard && targetIdx > -1) {
              mockBoards[targetIdx] = updatedBoard;
            }

            return { boards: nextBoards };
          });
        },

        updateComment: (boardId, commentId, content) => {
          const currentUser = get().currentUser;
          if (!currentUser) return;
          const nextContent = content.trim();
          if (!nextContent) return;

          set((state) => {
            const nextBoards = state.boards.map((board) => {
              if (board.id !== boardId) return board;
              return {
                ...board,
                comments: board.comments.map((c) => {
                  if (c.id !== commentId) return c;
                  const canEdit = currentUser.role === 'admin' || c.author.id === currentUser.id;
                  if (!canEdit) return c;
                  return { ...c, content: nextContent, updatedAt: new Date().toISOString() };
                }),
                updatedAt: new Date().toISOString()
              };
            });

            // 원본 데이터 동기화
            const updatedBoard = nextBoards.find(b => b.id === boardId);
            const targetIdx = mockBoards.findIndex(b => b.id === boardId);
            if (updatedBoard && targetIdx > -1) {
              mockBoards[targetIdx] = updatedBoard;
            }

            return { boards: nextBoards };
          });
        },

        deleteComment: (boardId, commentId) => {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          set((state) => {
            const nextBoards = state.boards.map((board) => {
              if (board.id !== boardId) return board;
              return {
                ...board,
                comments: board.comments.filter((c) => c.id !== commentId),
                updatedAt: new Date().toISOString()
              };
            });

            // 원본 데이터 동기화
            const updatedBoard = nextBoards.find(b => b.id === boardId);
            const targetIdx = mockBoards.findIndex(b => b.id === boardId);
            if (updatedBoard && targetIdx > -1) {
              mockBoards[targetIdx] = updatedBoard;
            }

            return { boards: nextBoards };
          });
        },

        incrementViewCount: (boardId) => {
          // 로컬 스토어 갱신
          set((state) => ({
            boards: state.boards.map((b) =>
              b.id === boardId ? { ...b, viewCount: (b.viewCount ?? 0) + 1 } : b
            )
          }));
        },

        addBoard: (data) => {
          const currentUser = get().currentUser;
          if (!currentUser) return null;

          const title = data.title.trim();
          const plain = data.contentPlain.trim();
          const html = data.contentHtml.trim();
          if (!title || !plain || !html) return null;

          const id = `board-${Date.now()}`;
          const now = new Date().toISOString();

          const tags: Tag[] = data.tagIds
            .map((tid) => mockTags.find((t) => t.id === tid))
            .filter((t): t is Tag => !!t);

          const attachments: Attachment[] = data.attachments.map((f, idx) => {
            const aid = `att-${Date.now()}-${idx}`;
            return {
              id: aid,
              filename: safeFilenameForStore(f.originalName),
              originalName: f.originalName,
              size: f.size,
              type: f.type,
              url: `/api/mock-files/${aid}`,
              uploadedAt: now
            };
          });

          const newBoard: Board = {
            id,
            title,
            content: html,
            author: currentUser,
            status: mockStatuses[0],
            tags,
            isSecret: data.isSecret,
            projectId: data.projectId,
            companyId: currentUser.companyId,
            createdAt: now,
            updatedAt: now,
            viewCount: 0,
            comments: [],
            attachments,
            workHours: 0
          };

          // mockBoards에도 추가하여 새로고침 시에도 유지되도록 함
          mockBoards.unshift(newBoard);

          set((state) => ({
            boards: [newBoard, ...state.boards]
          }));

          return id;
        },

        clearError: () => set({ error: null })
      }),
      {
        name: 'board-store',
        partialize: (state) => ({
          currentUser: state.currentUser
        })
      }
    ),
    {
      name: 'board-store'
    }
  )
);

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeFilenameForStore(name: string) {
  return name.replace(/[^\w.\-()가-힣]+/g, '_');
}

function parseDateStart(input: string) {
  // input: YYYY-MM-DD (from <input type="date">)
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return new Date(0);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateEnd(input: string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return new Date(8640000000000000);
  d.setHours(23, 59, 59, 999);
  return d;
}
