function EmptyState({ userFirstName, onOpenSidebar }) {
  return (
    <div
      className="flex flex-col justify-start mb-4"
      style={{ backgroundImage: "url('/balloon-background.jpg')" }}
    >
      <button
        className="rounded-xl border relative border-slate-200 px-3 py-2 h-12 w-12 text-sm lg:hidden top-10 left-3"
        type="button"
        onClick={onOpenSidebar}
      >
        <img src="/menu-outline.svg" alt="" className="h-6 w-6" />
      </button>
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold">
          Welcome back, {userFirstName}
        </h2>
        <p className="text-slate-500">
          Pick a contact or chat to start messaging.
        </p>
      </div>
    </div>
  );
}

export default EmptyState;
