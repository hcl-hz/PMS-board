import { NextResponse } from 'next/server';
import { mockAttachments } from '@/lib/mockData';

function safeFilename(name: string) {
  // Content-Disposition 헤더에 안전하게 넣기 위한 최소 처리
  return name.replace(/[\r\n"]/g, '_');
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const file = mockAttachments.find((f) => f.id === id);

  // 글쓰기에서 생성된 신규 첨부(목킹)도 다운로드 가능하도록 fallback 제공
  if (!file) {
    const fallbackName = safeFilename(`${id}.txt`);
    const content = `MOCK FILE (fallback)\n\nid: ${id}\n\n이 파일은 목킹 다운로드용으로 생성되었습니다.\n`;
    const bytes = new TextEncoder().encode(content);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fallbackName}"`,
        'Cache-Control': 'no-store'
      }
    });
  }

  const content = `MOCK FILE\n\nid: ${file.id}\nname: ${file.originalName}\nsize: ${file.size}\ntype: ${file.type}\n\n이 파일은 목킹 다운로드용으로 생성되었습니다.\n`;
  const bytes = new TextEncoder().encode(content);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFilename(file.originalName)}"`,
      'Cache-Control': 'no-store'
    }
  });
}


