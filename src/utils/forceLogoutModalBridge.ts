export type ForceLogoutModalPayload = {
  title: string;
  message: string;
};

type ForceLogoutModalHandler = (payload: ForceLogoutModalPayload) => void;

let handler: ForceLogoutModalHandler | null = null;
let pendingModal: ForceLogoutModalPayload | null = null;

export const registerForceLogoutModalHandler = (
  nextHandler: ForceLogoutModalHandler,
): (() => void) => {
  handler = nextHandler;

  if (pendingModal) {
    nextHandler(pendingModal);
    pendingModal = null;
  }

  return () => {
    if (handler === nextHandler) {
      handler = null;
    }
  };
};

export const showForceLogoutModal = (payload: ForceLogoutModalPayload): void => {
  if (handler) {
    handler(payload);
    return;
  }
  pendingModal = payload;
};

export const queueForceLogoutModal = (
  payload: ForceLogoutModalPayload,
): void => {
  pendingModal = payload;
  if (handler) {
    handler(payload);
    pendingModal = null;
  }
};

export const flushPendingForceLogoutModal = (): void => {
  if (!pendingModal) return;
  if (handler) {
    handler(pendingModal);
    pendingModal = null;
  }
};
