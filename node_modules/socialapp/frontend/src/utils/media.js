// Resolve a media path from the backend.
// In dev: path is relative like /uploads/images/foo.jpg → http://localhost:5000/uploads/images/foo.jpg
// In prod: path is relative → https://your-backend.onrender.com/uploads/images/foo.jpg
export const mediaUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath; // already absolute (Cloudinary etc.)
  const base = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${filePath}`;
};

export const avatarFallback = (name) =>
  name ? name.charAt(0).toUpperCase() : '?';
