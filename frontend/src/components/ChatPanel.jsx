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
  messagesContainerRef,
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
  onClosePickers,
  emotes,
  stickers,
  onInsertEmote,
  onSelectSticker,
  sendDisabled,
  status,
}) {
  if (!activeContact) {
    return (
      <main className="bg-slate-50 flex flex-col h-screen">
        <EmptyState
          userFirstName={user.fullName.split(" ")[0]}
          onOpenSidebar={onOpenSidebar}
        />
      </main>
    );
  }

  return (
    <main className="bg-slate-50 flex flex-col h-screen">
      <div className="flex flex-col h-full">
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
          messagesContainerRef={messagesContainerRef}
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

        {status && (
          <p className="text-rose-400 px-8 pb-4 max-[768px]:px-4">{status}</p>
        )}

        <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t border-slate-200">
          <MessageComposer
            messageText={messageText}
            onMessageChange={onMessageChange}
            onSendMessage={onSendMessage}
            onAttachment={onAttachment}
            onToggleEmotes={onToggleEmotes}
            onToggleStickers={onToggleStickers}
            onClosePickers={onClosePickers}
            showEmotes={showEmotes}
            showStickers={showStickers}
            emotes={emotes}
            stickers={stickers}
            onInsertEmote={onInsertEmote}
            onSelectSticker={onSelectSticker}
            sendDisabled={sendDisabled}
          />
        </div>
      </div>
    </main>
  );
}

export default ChatPanel;
