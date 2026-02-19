function EmptyState({ userFirstName, onOpenSidebar, onOpenProfile }) {
  return (
    <div className="flex flex-col justify-start mb-4">
      <div className="mt-12">
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold">
            Welcome back, {userFirstName}
          </h2>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center self-center gap-3 mt-48">
        <button
          className="rounded-xl border flex flex-col items-center justify-center relative bg-white/30 border-white/60 px-3 py-2 h-fit w-36 text-sm lg:hidden backdrop-blur-3xl shadow-lg shadow-black/10"
          type="button"
          onClick={onOpenSidebar}
        >
          <img src="/chatbubble.svg" alt="" className="h-12 w-12" />
          <p>Send a message</p>
        </button>
        <button
          className="rounded-xl border flex flex-col items-center justify-center relative bg-white/30 border-white/60 px-3 py-2 h-fit w-36 text-sm lg:hidden backdrop-blur-3xl shadow-lg shadow-black/10"
          type="button"
          onClick={onOpenProfile}
        >
          <img src="/create-outline.svg" alt="" className="h-12 w-12" />
          <p>Edit profile</p>
        </button>
      </div>
    </div>
  );
}

export default EmptyState;
