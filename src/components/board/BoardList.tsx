import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';
import { BoardItem } from './BoardItem';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Board, BoardFilter } from '@/lib/types';
import { mockStatuses, mockProjects } from '@/lib/mockData';

interface BoardListProps {
  onBoardClick?: (board: Board) => void;
}

export const BoardList: React.FC<BoardListProps> = ({ onBoardClick }) => {
  const PAGE_SIZE = 10;
  const router = useRouter();
  const {
    boards,
    loading,
    error,
    filter,
    searchQuery,
    loadBoards,
    setFilter,
    setSearchQuery,
    getFilteredBoards
  } = useBoardStore();

  const [filteredBoards, setFilteredBoards] = useState<Board[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isAutoLoading, setIsAutoLoading] = useState<boolean>(false);
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);

  const sortedProjects = [...mockProjects].sort((a, b) => {
    const ak = isKoreanFirst(a.name);
    const bk = isKoreanFirst(b.name);
    if (ak !== bk) return ak ? -1 : 1; // 한글 먼저
    return a.name.localeCompare(b.name, 'ko', { sensitivity: 'base' });
  });

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    const filtered = getFilteredBoards();
    setFilteredBoards(filtered);
    setVisibleCount(PAGE_SIZE);
  }, [boards, filter, searchQuery, getFilteredBoards]);

  useEffect(() => {
    if (!sentinelEl) return;
    if (visibleCount >= filteredBoards.length) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        setIsAutoLoading(true);
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredBoards.length));
      },
      { root: null, rootMargin: '200px 0px', threshold: 0 }
    );

    obs.observe(sentinelEl);
    return () => obs.disconnect();
  }, [sentinelEl, visibleCount, filteredBoards.length]);

  useEffect(() => {
    // visibleCount가 변해 더 로드됐으면 로딩 상태를 해제
    setIsAutoLoading(false);
  }, [visibleCount]);

  const handleStatusFilter = (statusCode: string | null) => {
    setFilter({
      ...filter,
      status: statusCode || undefined
    });
  };

  const handleProjectFilter = (projectId: string | null) => {
    setFilter({
      ...filter,
      projectId: projectId || undefined
    });
  };

  const handleDateFrom = (dateFrom: string) => {
    setFilter({
      ...filter,
      dateFrom: dateFrom || undefined
    });
  };

  const handleDateTo = (dateTo: string) => {
    setFilter({
      ...filter,
      dateTo: dateTo || undefined
    });
  };

  const clearFilters = () => {
    setFilter({});
    setSearchQuery('');
  };

  const hasActiveFilter =
    !!filter.status || !!filter.projectId || !!filter.dateFrom || !!filter.dateTo || !!searchQuery;

  if (loading) {
    return (
      <div className="board">
        <div className="board__empty">게시글을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board__empty">
        오류가 발생했습니다: {error}
        <div style={{ marginTop: 12 }}>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="board">
      {/* 페이지 헤더 */}
      <div className="board__header">
        <div>
          <div>
            <h2 className="board__title">게시글 목록</h2>
            <p className="board__desc">프로젝트 관련 이슈와 요청사항을 확인하고 관리하세요</p>
          </div>
        </div>
        <div>
          <Button onClick={() => router.push('/board/write')}>
            새 글 작성
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="board__filters">
        <div className="board__filters-row">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="제목, 내용, 작성자, 댓글, 태그로 검색..."
          />

          <div className="board__filters-right">
            <div className="board-select">
              <select
                value={filter.status || ''}
                onChange={(e) => handleStatusFilter(e.target.value || null)}
              >
                <option value="">모든 상태</option>
                {mockStatuses.map((status) => (
                  <option key={status.id} value={status.code}>
                    {status.label}
                  </option>
                ))}
              </select>
              <span className="board-select__chev" aria-hidden="true">▾</span>
            </div>

            <div className="board-select">
              <select
                value={filter.projectId || ''}
                onChange={(e) => handleProjectFilter(e.target.value || null)}
              >
                <option value="">모든 프로젝트</option>
                {sortedProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <span className="board-select__chev" aria-hidden="true">▾</span>
            </div>

            <div className="board-date">
              <span className="board-date__label">기간</span>
              <input
                className="board-date__input"
                type="date"
                value={filter.dateFrom || ''}
                onChange={(e) => handleDateFrom(e.target.value)}
                aria-label="시작일"
              />
              <span className="board-date__sep" aria-hidden="true">~</span>
              <input
                className="board-date__input"
                type="date"
                value={filter.dateTo || ''}
                onChange={(e) => handleDateTo(e.target.value)}
                aria-label="종료일"
              />
            </div>

            {hasActiveFilter && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                초기화
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilter && (
          <div className="board__active">
            {filter.status && (
              <Badge variant="info" size="sm">
                상태: {mockStatuses.find(s => s.code === filter.status)?.label}
              </Badge>
            )}
            {filter.projectId && (
              <Badge variant="info" size="sm">
                프로젝트: {mockProjects.find(p => p.id === filter.projectId)?.name}
              </Badge>
            )}
            {(filter.dateFrom || filter.dateTo) && (
              <Badge variant="info" size="sm">
                기간: {filter.dateFrom || '전체'} ~ {filter.dateTo || '전체'}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="info" size="sm">
                검색: "{searchQuery}"
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* 게시글 목록 */}
      <div>
        {filteredBoards.length === 0 ? (
          <div className="board__empty">
            {searchQuery || filter.status || filter.projectId
              ? '필터 조건에 맞는 게시글이 없습니다.'
              : '게시글이 없습니다.'}
          </div>
        ) : (
          <>
            {/* 게시글 테이블 */}
            <div className="board-table">
              <table>
                <thead>
                  <tr>
                    <th>
                      상태
                    </th>
                    <th>
                      제목
                    </th>
                    <th>
                      작성자
                    </th>
                    <th>
                      작성일
                    </th>
                    <th>
                      조회
                    </th>
                    <th>
                      댓글
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBoards.slice(0, visibleCount).map((board) => (
                    <BoardItem
                      key={board.id}
                      board={board}
                      onClick={onBoardClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {visibleCount < filteredBoards.length && (
              <div className="board-infinite">
                <div ref={setSentinelEl} className="board-infinite__sentinel" aria-hidden="true" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredBoards.length))}
                >
                  더 보기 ({visibleCount}/{filteredBoards.length})
                </Button>
                {isAutoLoading && (
                  <div className="board-infinite__hint">불러오는 중...</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function isKoreanFirst(input: string) {
  const first = input.trim().charAt(0);
  // 한글 음절/자모 범위(가-힣, ㄱ-ㅎ, ㅏ-ㅣ)
  return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(first);
}
