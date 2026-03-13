
let memoTextArea: HTMLTextAreaElement | null = null;

export const decodeHTMLEntities = (text: string) => {
  if (!text || !text.includes('&')) return text || '';
  if (!memoTextArea) {
    memoTextArea = document.createElement('textarea');
  }
  memoTextArea.innerHTML = text;
  return memoTextArea.value;
};
