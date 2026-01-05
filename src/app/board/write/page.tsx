'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useBoardStore } from '@/store/boardStore';
import { mockProjects, mockTags } from '@/lib/mockData';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { FileUploader } from '@/components/upload/FileUploader';

type FieldErrors = {
  title?: string;
  content?: string;
  projectId?: string;
  tags?: string;
};

const GUIDE_TEMPLATE = `1) 발생일시: \n2) 발생페이지: \n3) 증상: \n4) 재현 방법(가능하면): \n5) 기대 결과/실제 결과: \n`;

export default function BoardWritePage() {
  const router = useRouter();
  const { currentUser, addBoard } = useBoardStore();

  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [contentPlain, setContentPlain] = useState('');
  const [templateVersion, setTemplateVersion] = useState(0);
  const [projectId, setProjectId] = useState<string>(mockProjects[0]?.id ?? '');
  const [isSecret, setIsSecret] = useState(false);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const availableTags = useMemo(() => {
    // 요구사항: 글쓰기에서는 프로젝트와 무관하게 기본 태그(버그/기능요청/긴급/개선) 전체 선택 가능
    return mockTags;
  }, []);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!projectId) next.projectId = '프로젝트를 선택해주세요.';
    if (!title.trim()) next.title = '제목은 필수입니다.';
    if (!contentPlain.trim()) next.content = '내용은 필수입니다.';
    if (tagIds.length === 0) next.tags = '태그를 하나 이상 선택해주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onToggleTag = (id: string) => {
    setTagIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length > 0 && errors.tags) {
        setErrors((prevErr) => ({ ...prevErr, tags: undefined }));
      }
      return next;
    });
  };

  const onSubmit = () => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    if (!validate()) return;

    const newId = addBoard({
      title,
      contentHtml,
      contentPlain,
      projectId,
      isSecret,
      tagIds,
      attachments: files.map((f) => ({
        originalName: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream'
      }))
    });

    if (newId) {
      // 등록 후 뒤로가기로 글쓰기 화면으로 돌아가지 않도록 history를 replace로 처리
      router.replace(`/board/${newId}`);
    }
  };

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
                  {currentUser.role === 'admin' ? '관리자' :
                    currentUser.role === 'manager' ? '담당자' : '사용자'}
                </p>
              </span>
              <Button variant="outline" size="sm" onClick={() => router.back()}>뒤로</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="write">
            <div className="write__header">
              <h2 className="write__title">새 글 작성</h2>
              <p className="write__desc">제목과 내용을 입력하고 등록하세요.</p>
            </div>

            <div className="write-card">
              <div className="write-grid">
                <div className="write-field">
                  <label className="write-label">프로젝트 *</label>
                  <select
                    className="write-select"
                    value={projectId}
                    onChange={(e) => {
                      setProjectId(e.target.value);
                      setErrors((prev) => ({ ...prev, projectId: undefined }));
                    }}
                  >
                    {mockProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.projectId && <div className="write-error">{errors.projectId}</div>}
                </div>

                <div className="write-field">
                  <label className="write-label">제목 *</label>
                  <input
                    className="write-input"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    placeholder="제목을 입력하세요"
                    spellCheck={false}
                  />
                  {errors.title && <div className="write-error">{errors.title}</div>}
                </div>

                <div className="write-field">
                  <label className="write-label">내용 *</label>
                  <div className="write-guide">
                    <div className="write-guide__title">작성 가이드</div>
                    <div className="write-guide__desc">
                      아래 템플릿을 삽입하면 빠르게 작성할 수 있습니다.
                    </div>
                    <div className="write-guide__actions">
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => setTemplateVersion((v) => v + 1)}
                      >
                        템플릿 삽입
                      </Button>
                    </div>
                  </div>
                  <RichTextEditor
                    placeholder="내용을 입력하세요"
                    onChangeHtml={(html, plain) => {
                      setContentHtml(html);
                      setContentPlain(plain);
                      if (errors.content && plain.trim()) setErrors((prev) => ({ ...prev, content: undefined }));
                    }}
                    setText={{ text: GUIDE_TEMPLATE, version: templateVersion }}
                  />
                  {errors.content && <div className="write-error">{errors.content}</div>}
                </div>

                <div className="write-field write-inline">
                  <label className="write-check">
                    <input
                      type="checkbox"
                      checked={isSecret}
                      onChange={(e) => setIsSecret(e.target.checked)}
                    />
                    <span>비밀 게시글</span>
                  </label>
                </div>

                <div className="write-field">
                  <label className="write-label">태그 *</label>
                  {availableTags.length === 0 ? (
                    <div className="write-muted">선택 가능한 태그가 없습니다.</div>
                  ) : (
                    <div className="write-tags">
                      {availableTags.map((t) => (
                        <label key={t.id} className="write-tag">
                          <input
                            type="checkbox"
                            checked={tagIds.includes(t.id)}
                            onChange={() => onToggleTag(t.id)}
                          />
                          <span>{t.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {errors.tags && <div className="write-error">{errors.tags}</div>}
                </div>

                <div className="write-field">
                  <label className="write-label">첨부파일</label>
                  <FileUploader files={files} onChange={setFiles} />
                </div>
              </div>

              <div className="write-actions">
                <Button variant="outline" onClick={() => router.back()}>취소</Button>
                <Button onClick={onSubmit}>등록</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


