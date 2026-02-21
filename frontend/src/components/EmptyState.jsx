const buttonClass =
  "rounded-xl border flex flex-col items-center justify-center relative bg-white/30 border-white/60 px-3 py-2 h-fit w-36 text-sm lg:hidden backdrop-blur-3xl shadow-lg shadow-black/10";

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
      <div className="flex flex-wrap items-center justify-center self-center gap-3 mt-48">
        <button className={buttonClass} type="button" onClick={onOpenSidebar}>
          <img src="/messages-text.svg" alt="" className="h-12 w-12" />
          <p>Send a message</p>
        </button>
        <button className={buttonClass} type="button" onClick={onOpenProfile}>
          <img src="/edit-user-dark.svg" alt="" className="h-12 w-12" />
          <p>Edit profile</p>
        </button>
        <button className={buttonClass} type="button" onClick={onOpenProfile}>
          <img src="/person-add.svg" alt="" className="h-12 w-12" />
          <p>Add contact</p>
        </button>
      </div>
    </div>
  );
}

export default EmptyState;
