export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;

  try {
    return url.startsWith("http");
  } catch (e) {
    return false;
  }
};
