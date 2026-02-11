function StickerPreview({ sticker, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-8 py-3 max-[768px]:px-4">
      <img
        src={sticker.url}
        alt={sticker.name}
        className="w-24 h-24 rounded-xl object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full border border-slate-200 px-3 py-1 text-xs"
      >
        Remove
      </button>
    </div>
  );
}

export default StickerPreview;
