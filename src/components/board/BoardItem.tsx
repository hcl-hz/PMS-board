import React from 'react';
import { Board } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

interface BoardItemProps {
  board: Board;
  onClick?: (board: Board) => void;
}

export const BoardItem: React.FC<BoardItemProps> = ({ board, onClick }) => {
  const handleClick = () => {
    onClick?.(board);
  };

  const getStatusBadgeVariant = (statusCode: string) => {
    switch (statusCode) {
      case 'received': return 'default';
      case 'confirmed': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'hold': return 'orange';
      case 'cancelled': return 'error';
      case 'notice': return 'dark';
      default: return 'default';
    }
  };

  const formatContent = (content: string) => {
    // HTML 태그 제거 및 텍스트만 추출
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return format(d, 'yyyy-MM-dd');
  };

  return (
    <tr
      onClick={handleClick}
      className={`board-row ${board.status.code === 'notice' ? 'board-row--notice' : ''}`}
    >
      {/* 상태 */}
      <td>
        <div className={`status-stack ${board.isSecret ? 'status-stack--multi' : ''}`}>
          <Badge
            variant={getStatusBadgeVariant(board.status.code)}
            size="sm"
          >
            {board.status.label}
          </Badge>
          {board.isSecret && (
            <Badge variant="error" size="sm">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              비밀
            </Badge>
          )}
        </div>
      </td>

      {/* 제목 및 내용 */}
      <td>
        <div>
          <div className="board-title line-clamp-1">
            {board.title}
          </div>
          <div className="board-preview line-clamp-2">
            {formatContent(board.content)}
          </div>
          {board.tags.length > 0 && (
            <div className="board-tags">
              {board.tags.slice(0, 2).map((tag) => (
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
              {board.tags.length > 2 && (
                <span className="muted">+{board.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* 작성자 */}
      <td>
        <div className="author">
          <span>{board.author.name}</span>
        </div>
      </td>

      {/* 작성일 */}
      <td className="muted">
        {formatDate(board.createdAt)}
      </td>

      {/* 조회수 */}
      <td className="muted">
        {board.viewCount}
      </td>

      {/* 댓글 수 */}
      <td className="muted">
        {board.comments.length > 0 ? board.comments.length : '-'}
      </td>
    </tr>
  );
};
