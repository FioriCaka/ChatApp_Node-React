import AttachmentPreview from "./AttachmentPreview";
import ChatHeader from "./ChatHeader";
import EmptyState from "./EmptyState";
import MessageComposer from "./MessageComposer";
import MessageList from "./MessageList";
import ReplyBanner from "./ReplyBanner";
import StickerPreview from "./StickerPreview";

function ChatPanel({
  activeContact,
  user,
  typingUsers,
  onlineIds,
  contactInitials,
  onOpenSidebar,
  onCloseChat,
  messages,
  messagesEndRef,
  editingMessageId,
  editingText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onReply,
  onForward,
  onReact,
  onDelete,
  replyTo,
  onCancelReply,
  attachment,
  onRemoveAttachment,
  sticker,
  onRemoveSticker,
  messageText,
  onMessageChange,
  onSendMessage,
  onAttachment,
  showEmotes,
  showStickers,
  onToggleEmotes,
  onToggleStickers,
  emotes,
  stickers,
  onInsertEmote,
  onSelectSticker,
  sendDisabled,
  status,
}) {
  if (!activeContact) {
    return (
      <main className="chat-panel">
        <EmptyState
          userFirstName={user.fullName.split(" ")[0]}
          onOpenSidebar={onOpenSidebar}
        />
      </main>
    );
  }

  return (
    <main className="chat-panel">
      <div className="chat-container">
        <ChatHeader
          activeContact={activeContact}
          contactInitials={contactInitials}
          typingUsers={typingUsers}
          onlineIds={onlineIds}
          onOpenSidebar={onOpenSidebar}
          onCloseChat={onCloseChat}
        />

        <MessageList
          messages={messages}
          userId={user._id}
          editingMessageId={editingMessageId}
          editingText={editingText}
          onEditTextChange={onEditTextChange}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onReply={onReply}
          onForward={onForward}
          onReact={onReact}
          onDelete={onDelete}
          messagesEndRef={messagesEndRef}
        />

        {replyTo && <ReplyBanner replyTo={replyTo} onCancel={onCancelReply} />}

        {attachment && (
          <AttachmentPreview
            attachment={attachment}
            onRemove={onRemoveAttachment}
          />
        )}

        {sticker && (
          <StickerPreview sticker={sticker} onRemove={onRemoveSticker} />
        )}

        <MessageComposer
          messageText={messageText}
          onMessageChange={onMessageChange}
          onSendMessage={onSendMessage}
          onAttachment={onAttachment}
          onToggleEmotes={onToggleEmotes}
          onToggleStickers={onToggleStickers}
          showEmotes={showEmotes}
          showStickers={showStickers}
          emotes={emotes}
          stickers={stickers}
          onInsertEmote={onInsertEmote}
          onSelectSticker={onSelectSticker}
          sendDisabled={sendDisabled}
        />

        {status && <p className="error">{status}</p>}
      </div>
    </main>
  );
}

export default ChatPanel;
