function AttachmentPreview({ attachment, onRemove }) {
  return (
    <div className="attachment-preview">
      {attachment.image ? (
        <img src={attachment.image} alt="preview" />
      ) : (
        <div className="file-pill">
          <a href={attachment.fileUrl} target="_blank" rel="noreferrer">
            {attachment.fileName}
          </a>
        </div>
      )}
      <button type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

export default AttachmentPreview;
