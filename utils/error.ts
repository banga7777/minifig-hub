export const isAbortError = (err: any) => {
  if (!err) return false;
  if (err instanceof Error) {
    return err.name === 'AbortError' || err.message?.includes('AbortError') || err.message?.includes('signal is aborted');
  }
  if (typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message.includes('AbortError') || err.message.includes('signal is aborted');
  }
  return false;
};
