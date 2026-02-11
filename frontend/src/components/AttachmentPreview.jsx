function AttachmentPreview({ attachment, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-8 py-3 max-[768px]:px-4">
      {attachment.image ? (
        <img
          src={attachment.image}
          alt="preview"
          className="w-24 h-24 rounded-xl object-cover"
        />
      ) : (
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/10 px-3 py-1 text-sm">
          <a
            href={attachment.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-inherit no-underline"
          >
            {attachment.fileName}
          </a>
        </div>
      )}
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

export default AttachmentPreview;
