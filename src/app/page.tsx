'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BoardList } from '@/components/board/BoardList';
import { useBoardStore } from '@/store/boardStore';
import { mockUsers } from '@/lib/mockData';
import { User, Board } from '@/lib/types';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useBoardStore();

  useEffect(() => {
    // 자동 로그인 로직 제거 (Persist 미들웨어가 currentUser를 관리함)
  }, []);

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
  };

  const handleBoardClick = (board: Board) => {
    router.push(`/board/${board.id}`);
  };

  if (!currentUser) {
    return (
      <div className="page">
        {/* 헤더 */}
        <header className="site-header">
          <div className="container">
            <div className="site-header__inner">
              <div className="brand">
                <div className="brand__mark" aria-hidden="true">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="brand__title">PMS 게시판</h1>
                </div>
              </div>
              <div className="header-meta">데모 시스템</div>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="main">
          <div className="container">
            <div className="hero">
              <h2 className="hero__title">PMS 게시판 시스템</h2>
              <p className="hero__subtitle">프로젝트 관련 이슈와 요청사항을 효과적으로 관리하세요</p>
            </div>

            {/* 사용자 선택 섹션 */}
            <div className="select-card">
              <div className="select-card__header">
                <h3 className="select-card__title">계정 선택</h3>
                <p className="select-card__desc">데모 체험을 위한 테스트 계정</p>
              </div>

              <div className="user-list">
                {mockUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserChange(user)}
                    className="user-row"
                  >
                    <span>
                      <div className="user-row__name">{user.name}</div>
                      <div className="user-row__role">
                        {user.role === 'admin' ? '관리자' : '담당자'}
                      </div>
                    </span>
                  </button>
                ))}
              </div>

              <div className="select-card__footer">
                각 계정별로 다른 권한이 적용됩니다
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      {/* 헤더 */}
      <header className="site-header">
        <div className="container">
          <div className="site-header__inner">
            {/* 로고 영역 */}
            <div className="brand">
              <div className="brand__mark" aria-hidden="true">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="brand__title">PMS 게시판</h1>
              </div>
            </div>

            {/* 사용자 정보 및 액션 */}
            <div className="user-chip">
              <span className="user-chip__info">
                <p className="user-chip__name">{currentUser.name}</p>
                <p className="user-chip__role">
                  {currentUser.role === 'admin' ? '관리자' :
                   currentUser.role === 'manager' ? '담당자' : '사용자'}
                </p>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentUser(null);
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="main">
        <div className="container">
          <BoardList onBoardClick={handleBoardClick} />
        </div>
      </main>
    </div>
  );
}
