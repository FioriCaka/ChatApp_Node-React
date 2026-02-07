function StickerPreview({ sticker, onRemove }) {
  return (
    <div className="attachment-preview">
      <img src={sticker.url} alt={sticker.name} />
      <button type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

export default StickerPreview;
