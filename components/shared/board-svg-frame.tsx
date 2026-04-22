export function BoardSvgFrame({ svg }: { svg: string }) {
  return (
    <div
      className="board-frame overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_28px_80px_rgba(52,36,27,0.12)]"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
