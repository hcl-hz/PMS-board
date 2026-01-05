'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useBoardStore } from '@/store/boardStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockStatuses } from '@/lib/mockData';

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const boardId = params?.id;

  const {
    currentUser,
    boards,
    loadBoards,
    addComment,
    updateComment,
    deleteComment,
    incrementViewCount,
    updateBoardStatus,
    updateBoardWorkHours
  } = useBoardStore();

  const [commentText, setCommentText] = useState('');
  const [internalText, setInternalText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 등록 방지 상태 추가
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [pendingCommentId, setPendingCommentId] = useState<string | null>(null);
  const MAX_COMMENT_LENGTH = 200;

  // Zustand Persist 하이드레이션 완료 대기
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // 목록 페이지를 거치지 않고 바로 들어오는 경우를 대비해 로드
    if (boards.length === 0) {
      loadBoards();
    }
  }, [boards.length, loadBoards]);

  const board = useBoardStore((state) => 
    boardId ? state.boards.find(b => b.id === boardId) : undefined
  );

  const canAccess = useMemo(() => {
    if (!board) return false;
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (!board.isSecret) return true;
    return board.author.id === currentUser.id;
  }, [board, currentUser]);

  useEffect(() => {
    if (!boardId) return;
    if (!board || !canAccess) return;
    if (typeof window === 'undefined') return;

    const key = `viewed-board:${boardId}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
    incrementViewCount(boardId);
  }, [boardId, board, incrementViewCount, canAccess]);

  const canSeeInternal = currentUser?.role === 'admin';
  const canModerate = useMemo(() => currentUser?.role === 'admin', [currentUser]);

  const publicComments = useMemo(() => {
    if (!board) return [];
    return board.comments.filter((c) => !c.isInternal);
  }, [board]);

  const internalComments = useMemo(() => {
    if (!board) return [];
    return board.comments.filter((c) => c.isInternal);
  }, [board]);

  const onSubmitComment = () => {
    if (!board || isSubmitting) return;
    const content = commentText.trim();
    if (!content) return;
    if (content.length > MAX_COMMENT_LENGTH) return;

    setIsSubmitting(true);
    try {
      addComment(board.id, content, false);
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitInternal = () => {
    if (!board || isSubmitting) return;
    const content = internalText.trim();
    if (!content) return;
    if (content.length > MAX_COMMENT_LENGTH) return;

    setIsSubmitting(true);
    try {
      addComment(board.id, content, true);
      setInternalText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, isInternal: boolean) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (isSubmitting) return;
      if (isInternal) onSubmitInternal();
      else onSubmitComment();
    }
  };

  const startEdit = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingText(content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleStatusChangeClick = (statusId: string) => {
    setPendingStatusId(statusId);
    setIsConfirmModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (board && pendingStatusId) {
      updateBoardStatus(board.id, pendingStatusId);
    }
    setIsConfirmModalOpen(false);
    setPendingStatusId(null);
  };

  const cancelStatusChange = () => {
    setIsConfirmModalOpen(false);
    setPendingStatusId(null);
  };

  const saveEdit = (commentId: string) => {
    if (!board) return;
    const content = editingText.trim();
    if (!content) return;
    updateComment(board.id, commentId, content);
    cancelEdit();
  };

  const onDelete = (commentId: string) => {
    setPendingCommentId(commentId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (board && pendingCommentId) {
      deleteComment(board.id, pendingCommentId);
      if (editingCommentId === pendingCommentId) cancelEdit();
    }
    setIsDeleteModalOpen(false);
    setPendingCommentId(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPendingCommentId(null);
  };

  const goToList = () => {
    router.push('/');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isHydrated) {
    return null;
  }

  if (!currentUser) {
    return (
      <div className="page">
        <header className="site-header">
          <div className="container">
            <div className="site-header__inner">
              <div className="brand">
                <div className="brand__mark" aria-hidden="true">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="brand__title">PMS 게시판</h1>
              </div>
              <div className="header-meta">로그인이 필요합니다</div>
            </div>
          </div>
        </header>
        <main className="main">
          <div className="container">
            <div className="board__empty">
              로그인 후 이용해주세요.
              <div style={{ marginTop: 12 }}>
                <Button onClick={() => router.push('/')}>홈으로</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!board || !canAccess) {
    return (
      <div className="page">
        <header className="site-header">
          <div className="container">
            <div className="site-header__inner">
              <div className="brand">
                <div className="brand__mark" aria-hidden="true">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="brand__title">PMS 게시판</h1>
              </div>
              <div className="header-meta">{currentUser.name}</div>
            </div>
          </div>
        </header>
        <main className="main">
          <div className="container">
            <div className="board__empty">
              {!board ? '게시글을 찾을 수 없습니다.' : '비밀 게시글입니다. 작성자와 관리자만 확인 가능합니다.'}
              <div style={{ marginTop: 12 }}>
                <Button variant="outline" onClick={() => router.push('/')}>글 목록 가기</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="container">
          <div className="site-header__inner">
            <div className="brand">
              <div className="brand__mark" aria-hidden="true">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="brand__title">PMS 게시판</h1>
            </div>

            <div className="user-chip">
              <span className="user-chip__info">
                <p className="user-chip__name">{currentUser.name}</p>
                <p className="user-chip__role">
                  {currentUser.role === 'admin' ? '관리자' : '담당자'}
                </p>
              </span>
              <Button variant="outline" size="sm" onClick={goToList}>글 목록 가기</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="detail">
            <div className="detail__top">
              <Button variant="outline" size="sm" onClick={goToList}>← 글 목록 가기</Button>
            </div>

            <div className="detail__header">
              <div className="detail__header-top">
                <h2 className="detail__title">{board.title}</h2>
                
                <div className="detail__badges">
                  {canModerate ? (
                    <div className="board-select board-select--status-admin">
                      <select
                        value={board.status.id}
                        onChange={(e) => handleStatusChangeClick(e.target.value)}
                        className="status-select-admin"
                      >
                        {mockStatuses.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <span className="board-select__chev" aria-hidden="true">▾</span>
                    </div>
                  ) : (
                    <Badge 
                      size="sm" 
                      variant={
                        board.status.code === 'notice' ? 'dark' :
                        board.status.code === 'hold' ? 'orange' :
                        board.status.code === 'completed' ? 'success' :
                        board.status.code === 'in_progress' ? 'warning' :
                        board.status.code === 'confirmed' ? 'info' :
                        board.status.code === 'cancelled' ? 'error' : 'default'
                      }
                    >
                      {board.status.label}
                    </Badge>
                  )}
                  {board.isSecret && <Badge size="sm" variant="error">비밀</Badge>}
                </div>
              </div>

              <div className="detail__meta">
                <div className="detail__meta-left">
                  <div className="detail__meta-item">
                    <span className="muted">작성자</span>
                    <span className="detail__meta-value">{board.author.name}</span>
                  </div>
                  <div className="detail__meta-item">
                    <span className="muted">작성일</span>
                    <span className="detail__meta-value">
                      {format(new Date(board.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                    </span>
                  </div>
                  <div className="detail__meta-item">
                    <span className="muted">조회</span>
                    <span className="detail__meta-value">{board.viewCount}</span>
                  </div>
                </div>
              </div>

              <div className="detail__tags-row">
                {board.tags.length > 0 && (
                  <div className="board-tags">
                    {board.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="tag"
                        style={{
                          backgroundColor: tag.color + '15',
                          color: tag.color,
                          borderColor: tag.color + '30'
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {canSeeInternal && (
                  <div className="detail__meta-admin-tag">
                    <span className="detail__admin-label">작업공수</span>
                    {canModerate ? (
                      <div className="detail__workhours-input">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={board.workHours ?? 0}
                          onChange={(e) => updateBoardWorkHours(board.id, parseFloat(e.target.value) || 0)}
                        />
                        <span className="detail__unit">M/d</span>
                      </div>
                    ) : (
                      <span className="detail__workhours-value">{board.workHours ?? 0} M/d</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="detail__body">
              <section className="detail-card">
                <div className="detail-card__title">본문</div>
                <div
                  className="detail__content"
                  dangerouslySetInnerHTML={{ __html: board.content }}
                />
              </section>

              <section className="detail-card detail-card--attachments">
                <div className="detail-card__title">첨부파일</div>
                {!board.attachments || board.attachments.length === 0 ? (
                  <div className="muted">첨부파일이 없습니다.</div>
                ) : (
                  <ul className="file-list">
                    {board.attachments.map((f) => (
                      <li key={f.id} className="file-item">
                        <div className="file-item__info">
                          <div className="file-item__details">
                            <span className="file-item__name">{f.originalName}</span>
                            <span className="file-item__meta muted">
                              {formatFileSize(f.size)}
                            </span>
                          </div>
                        </div>
                        <div className="file-item__actions">
                          <a className="file-item__link" href={`/api/mock-files/${f.id}`} download aria-label="내려받기">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className={`detail__comments-grid ${!canSeeInternal ? 'detail__comments-grid--single' : ''}`}>
              <section className="detail-card">
                <div className="detail-card__title">댓글</div>
                {publicComments.length === 0 ? (
                  <div className="muted">댓글이 없습니다.</div>
                ) : (
                  <ul className="comment-list">
                    {publicComments.map((c) => (
                      <li key={c.id} className={`comment ${c.author.id === currentUser.id ? 'comment--self' : ''}`}>
                        <div className="comment__top">
                          <div className="comment__author-info">
                            <span className="comment__author">{c.author.name}</span>
                            <span className="comment__role-badge">
                              {c.author.role === 'admin' ? '관리자' : '담당자'}
                            </span>
                          </div>
                          <span className="comment__right">
                            <span className="comment__date muted">
                              {format(new Date(c.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                            </span>
                            {(canModerate || c.author.id === currentUser.id) && (
                              <span className="comment__actions">
                                {editingCommentId !== c.id && (
                                  <button className="comment__btn" onClick={() => startEdit(c.id, c.content)}>
                                    수정
                                  </button>
                                )}
                                <button className="comment__btn comment__btn--danger" onClick={() => onDelete(c.id)}>
                                  삭제
                                </button>
                              </span>
                            )}
                          </span>
                        </div>
                        {editingCommentId === c.id ? (
                          <div className="comment-edit">
                            <textarea
                              className="comment-form__textarea"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              rows={3}
                            />
                            <div className="comment-edit__actions">
                              <Button variant="outline" size="sm" onClick={cancelEdit}>취소</Button>
                              <Button size="sm" onClick={() => saveEdit(c.id)}>저장</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="comment__body">{c.content}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="comment-form">
                  <div className="comment-form__input-container">
                    <textarea
                      className="comment-form__textarea"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, false)}
                      placeholder="댓글을 입력하세요... (Ctrl+Enter 등록)"
                      rows={3}
                    />
                    <div className={`comment-form__counter ${commentText.length > MAX_COMMENT_LENGTH ? 'comment-form__counter--error' : ''}`}>
                      {commentText.length} / {MAX_COMMENT_LENGTH}
                    </div>
                  </div>
                  <div className="comment-form__actions" style={{justifyContent: 'flex-end'}}>
                    <Button onClick={onSubmitComment}>등록</Button>
                  </div>
                </div>
              </section>

              {canSeeInternal && (
                <section className="detail-card">
                  <div className="detail-card__title">내부 메모</div>
                  {internalComments.length === 0 ? (
                    <div className="muted">내부 메모가 없습니다.</div>
                  ) : (
                    <ul className="comment-list">
                      {internalComments.map((c) => (
                        <li key={c.id} className={`comment comment--internal ${c.author.id === currentUser.id ? 'comment--self' : ''}`}>
                          <div className="comment__top">
                            <div className="comment__author-info">
                              <span className="comment__author">
                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{marginRight: 4, verticalAlign: 'middle'}}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                {c.author.name}
                              </span>
                              <span className="comment__role-badge">
                                {c.author.role === 'admin' ? '관리자' : '담당자'}
                              </span>
                            </div>
                            <span className="comment__right">
                              <span className="comment__date muted">
                                {format(new Date(c.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                              </span>
                              {(canModerate || c.author.id === currentUser.id) && (
                                <span className="comment__actions">
                                  {editingCommentId !== c.id && (
                                    <button className="comment__btn" onClick={() => startEdit(c.id, c.content)}>
                                      수정
                                    </button>
                                  )}
                                  <button className="comment__btn comment__btn--danger" onClick={() => onDelete(c.id)}>
                                    삭제
                                  </button>
                                </span>
                              )}
                            </span>
                          </div>
                          {editingCommentId === c.id ? (
                            <div className="comment-edit">
                              <textarea
                                className="comment-form__textarea"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                rows={3}
                              />
                              <div className="comment-edit__actions">
                                <Button variant="outline" size="sm" onClick={cancelEdit}>취소</Button>
                                <Button size="sm" onClick={() => saveEdit(c.id)}>저장</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="comment__body">{c.content}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="comment-form" style={{marginTop: 16}}>
                    <div className="comment-form__input-container">
                      <textarea
                        className="comment-form__textarea"
                        style={{backgroundColor: '#fff7ed', borderColor: '#fed7aa'}}
                        value={internalText}
                        onChange={(e) => setInternalText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, true)}
                        placeholder="내부 전용 메모를 입력하세요... (Ctrl+Enter 등록)"
                        rows={3}
                      />
                      <div className={`comment-form__counter ${internalText.length > MAX_COMMENT_LENGTH ? 'comment-form__counter--error' : ''}`}>
                        {internalText.length} / {MAX_COMMENT_LENGTH}
                      </div>
                    </div>
                    <div className="comment-form__actions" style={{justifyContent: 'flex-end'}}>
                      <Button onClick={onSubmitInternal}>메모 등록</Button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 상태 변경 확인 커스텀 모달 */}
      {isConfirmModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">상태 변경 확인</h3>
            </div>
            <div className="modal__body">
              <p>게시글의 상태를 <strong>[{mockStatuses.find(s => s.id === pendingStatusId)?.label}]</strong>(으)로 변경하시겠습니까?</p>
            </div>
            <div className="modal__footer">
              <Button variant="outline" onClick={cancelStatusChange}>취소</Button>
              <Button onClick={confirmStatusChange}>변경</Button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 삭제 확인 커스텀 모달 */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">댓글 삭제 확인</h3>
            </div>
            <div className="modal__body">
              <p>이 댓글을 정말로 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다.</p>
            </div>
            <div className="modal__footer">
              <Button variant="outline" onClick={cancelDelete}>취소</Button>
              <Button onClick={confirmDelete}>삭제</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
