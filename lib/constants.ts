export const MEDIA_PATTERNS = {
  GIF: /\.gif$|giphy\.com|tenor\.com/i,
  YOUTUBE: /youtube\.com\/watch|youtu\.be/i,
  IMAGE: /\.(jpg|jpeg|png|webp)$/i,
} as const;

export const ANIMATION_DURATION = {
  COPY_FEEDBACK: 2000,
  FADE: 300,
  SLIDE: 200,
} as const;

export const UI_CONSTANTS = {
  MAX_TRUNCATED_URL_LENGTH: 200,
  MESSAGE_INPUT_PLACEHOLDER: 'Type a message or paste a link...',
  COPY_SUCCESS_MESSAGE: 'Link copied to clipboard',
  COPY_ERROR_MESSAGE: 'Failed to copy link',
} as const;