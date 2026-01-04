/* 
==================================================
PMS 시스템 데이터베이스 구축 스크립트 (v1.3)
==================================================
- 대상 DB: MariaDB / MySQL
- 수정 사항: MariaDB 전용 UUID 및 코멘트 문법 적용
==================================================
*/

-- 외래 키 체크 해제 (테이블 삭제 및 재생성을 위해)
SET FOREIGN_KEY_CHECKS = 0;

-- 기존 테이블 삭제
DROP TABLE IF EXISTS attachments;

DROP TABLE IF EXISTS comments;

DROP TABLE IF EXISTS board_tags;

DROP TABLE IF EXISTS boards;

DROP TABLE IF EXISTS tags;

DROP TABLE IF EXISTS board_statuses;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS projects;

-- 외래 키 체크 재설정
SET FOREIGN_KEY_CHECKS = 1;

-- 1. 기초 테이블 생성 및 컬럼 코멘트 설정

-- [프로젝트 테이블]
CREATE TABLE projects (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '프로젝트명 (예: 웹사이트 리뉴얼)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '프로젝트 등록 일시'
) COMMENT = '시스템에서 관리하는 프로젝트 목록';

-- [사용자 테이블]
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '사용자 성명',
    role ENUM('admin', 'manager') NOT NULL COMMENT '사용자 권한 (admin: 관리자, manager: 담당자)',
    assigned_project_ids JSON COMMENT '담당자에게 할당된 프로젝트 ID 목록 (JSON 배열)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성 일시'
) COMMENT = '관리자 및 담당자 정보';

-- [게시글 상태 코드 테이블]
CREATE TABLE board_statuses (
    id VARCHAR(50) PRIMARY KEY COMMENT '상태 코드 아이디 (예: status-notice)',
    name VARCHAR(50) NOT NULL COMMENT '상태명 (예: 공지, 진행중)',
    color VARCHAR(20) COMMENT 'UI 표시용 배경 색상 코드 (HEX)',
    label VARCHAR(50) COMMENT 'UI 표시용 라벨 텍스트'
) COMMENT = '게시글의 상태 구분 코드 마스터';

-- [태그 테이블]
CREATE TABLE tags (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '태그명 (예: 버그, 개선, 긴급)'
) COMMENT = '게시글 분류용 태그 마스터';

-- [게시글 메인 테이블]
CREATE TABLE boards (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) COMMENT '소속 프로젝트 식별자 (FK)',
    author_id CHAR(36) COMMENT '작성자 식별자 (FK)',
    status_id VARCHAR(50) COMMENT '현재 게시글 상태 식별자 (FK)',
    title VARCHAR(255) NOT NULL COMMENT '게시글 제목',
    content TEXT NOT NULL COMMENT '게시글 본문 (Lexical 에디터 데이터)',
    view_count INTEGER DEFAULT 0 COMMENT '조회수',
    work_hours INTEGER DEFAULT 0 COMMENT '작업 공수 (시간 단위, 관리자 전용)',
    is_secret BOOLEAN DEFAULT FALSE COMMENT '비밀글 여부 (1: 비밀글)',
    is_notice BOOLEAN DEFAULT FALSE COMMENT '공지글 여부 (1: 최상단 노출)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '게시글 작성 일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '게시글 수정 일시',
    CONSTRAINT fk_board_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_board_author FOREIGN KEY (author_id) REFERENCES users (id),
    CONSTRAINT fk_board_status FOREIGN KEY (status_id) REFERENCES board_statuses (id)
) COMMENT = '게시판 메인 데이터';

-- [게시글-태그 매핑 테이블]
CREATE TABLE board_tags (
    board_id CHAR(36) NOT NULL COMMENT '게시글 식별자',
    tag_id CHAR(36) NOT NULL COMMENT '태그 식별자',
    PRIMARY KEY (board_id, tag_id),
    CONSTRAINT fk_tag_board FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE,
    CONSTRAINT fk_tag_master FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
) COMMENT = '게시글과 태그 사이의 다대다(N:M) 연결 테이블';

-- [댓글 및 내부 메모 테이블]
CREATE TABLE comments (
    id CHAR(36) PRIMARY KEY,
    board_id CHAR(36) COMMENT '대상 게시글 식별자 (FK)',
    author_id CHAR(36) COMMENT '댓글 작성자 식별자 (FK)',
    content VARCHAR(200) NOT NULL COMMENT '댓글 내용 (최대 200자)',
    is_internal BOOLEAN DEFAULT FALSE COMMENT '내부 메모 여부 (1: 관리자 전용)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '댓글 작성 일시',
    CONSTRAINT fk_comment_board FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users (id)
) COMMENT = '공개 댓글 및 관리자 전용 내부 메모';

-- [첨부파일 테이블]
CREATE TABLE attachments (
    id CHAR(36) PRIMARY KEY,
    board_id CHAR(36) COMMENT '대상 게시글 식별자 (FK)',
    file_name VARCHAR(255) NOT NULL COMMENT '실제 파일명',
    file_size BIGINT NOT NULL COMMENT '파일 크기 (Byte 단위)',
    file_url TEXT NOT NULL COMMENT '파일 저장소 접근 경로',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '파일 업로드 일시',
    CONSTRAINT fk_attachment_board FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE
) COMMENT = '게시글별 첨부파일 정보';

-- 2. 초기 데이터 삽입 (DML)
-- MariaDB에서는 UUID() 함수를 사용하여 ID를 직접 넣습니다.

INSERT INTO
    board_statuses (id, name, color, label)
VALUES (
        'status-notice',
        '공지',
        '#374151',
        '공지'
    ),
    (
        'status-todo',
        '확인중',
        '#94a3b8',
        '확인중'
    ),
    (
        'status-progress',
        '진행중',
        '#dcfce7',
        '진행중'
    ),
    (
        'status-hold',
        '보류됨',
        '#ffedd5',
        '보류됨'
    ),
    (
        'status-done',
        '완료됨',
        '#e2e8f0',
        '완료됨'
    );

INSERT INTO
    projects (id, name)
VALUES (UUID(), '웹사이트 리뉴얼'),
    (UUID(), '모바일 앱 개발'),
    (UUID(), '사내 ERP 시스템');

INSERT INTO
    users (id, name, role)
VALUES (UUID(), '김관리자', 'admin'),
    (UUID(), '박담당자', 'manager'),
    (UUID(), '정개발자', 'manager');

INSERT INTO
    tags (id, name)
VALUES (UUID(), '버그'),
    (UUID(), '기능요청'),
    (UUID(), '긴급'),
    (UUID(), '개선');

-- 3. 인덱스 생성
CREATE INDEX idx_boards_project ON boards (project_id);

CREATE INDEX idx_boards_author ON boards (author_id);

CREATE INDEX idx_comments_board ON comments (board_id);

CREATE INDEX idx_attachments_board ON attachments (board_id);