function ReplyBanner({ replyTo, onCancel }) {
  return (
    <div className="reply-banner">
      <span>
        Replying to:{" "}
        {replyTo.text ||
          replyTo.fileName ||
          replyTo.stickerName ||
          "Attachment"}
      </span>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export default ReplyBanner;
