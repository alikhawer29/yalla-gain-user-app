import type { ImageSourcePropType } from 'react-native';
import images from '../assets/images';

/** Main backend origin (scheme + host, no path). Change here for staging/production. */
// export const API_BASE_URL = 'https://custom-dev.onlinetestingserver.com';
// export const API_BASE_URL = 'http://109.1.1.3';
export const API_BASE_URL = 'http://109.1.1.12';

/** User-scoped REST API (`.../api/user/*`). */
export const API_USER_BASE_URL = `${API_BASE_URL}/yalla-backend/api/user/`;

/** Shared API root (`.../yalla-backend/api/*`) — e.g. OTP is `/verify-otp`, not `/user/verify-otp`. */
export const API_BASE_API_PREFIX = `${API_BASE_URL}/yalla-backend/api`;

/** Socket.IO realtime server (same host, port 2170). */
export const SOCKET_SERVER_URL = `https://custom-dev.onlinetestingserver.com:2170`;

export const TABS = [
  {
    label: 'Login',
    value: 'login',
  },
  {
    label: 'Register',
    value: 'register',
  },
];

export const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.';

export const USER = {
  first_name: 'John',
  last_name: 'Elbert',
  email: 'john.elbert@gmail.com',
  phone: '(646) 000-0000',
  dob: '10/07/2025',
  language: 'English',
  unique_code: 'AB#092178',
  image: images.dummy,
  role: 'User',
};

export const capitalizeFirst = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1);

/** e.g. `face_yoga` → "Face Yoga"; single words stay title-cased. */
export const capitalizeWords = (str = '') => {
  const s = String(str).trim();
  if (!s) return '';
  if (/^n\/?a$/i.test(s)) return 'N/A';
  return s
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/** Static templates: icons + keywords to match API `challenge_name` when no remote image. */
export const PROGRESS_TRACKING = [
  {
    title: 'Running Progress',
    progress: 80,
    icon: images.run,
    keywords: ['run', 'running', 'jog', 'cardio', 'sprint'],
  },
  {
    title: 'Fitness Progress',
    progress: 90,
    icon: images.dumbbell,
    keywords: ['fitness', 'gym', 'strength', 'lift', 'muscle'],
  },
  {
    title: 'Boxing Progress',
    progress: 100,
    icon: images.kabaddi,
    keywords: ['box', 'boxing', 'fight', 'kabaddi'],
  },
  {
    title: 'Workout Progress',
    progress: 10,
    icon: images.martial_arts,
    keywords: ['workout', 'martial', 'yoga', 'stretch', 'mobility'],
  },
] as const;

const DEFAULT_PROGRESS_ICON = images.dumbbell;

/**
 * Icon for a progress-tracking row: prefer API `image` / `image_url`, else match `challenge_name`
 * against {@link PROGRESS_TRACKING} keywords, else first word of template title, else default.
 */
export function getProgressTrackingIconSource(
  challengeName: string | undefined,
  remoteImageUrl?: string | null,
): ImageSourcePropType {
  const url = typeof remoteImageUrl === 'string' ? remoteImageUrl.trim() : '';
  if (url) {
    return { uri: url };
  }

  const q = (challengeName ?? '').toLowerCase().trim();
  if (!q) {
    return DEFAULT_PROGRESS_ICON;
  }

  for (const row of PROGRESS_TRACKING) {
    if (row.keywords.some(k => q.includes(k.toLowerCase()))) {
      return row.icon;
    }
  }

  for (const row of PROGRESS_TRACKING) {
    const first = row.title.split(/\s+/)[0]?.toLowerCase();
    if (first && first !== 'progress' && q.includes(first)) {
      return row.icon;
    }
  }

  return DEFAULT_PROGRESS_ICON;
}

export const bodyPartOptions = [
  { value: 'run', text: 'Running' },
  { value: 'cycle', text: 'Cycling' },
  { value: 'workout', text: 'Workout' },
  { value: 'strength', text: 'Strength' },
  { value: 'face_yoga', text: 'Face Yoga' },
  { value: 'cardio', text: 'Cardio' },
];

/** Dropdown `items`: All + {@link bodyPartOptions}; API query `type` = selected `value` (e.g. `type=arms`). */
export const challengeBodyPartOptions = [
  { label: 'All', value: '' },
  ...bodyPartOptions.map(o => ({ label: o.text, value: o.value })),
];

export const RECOMMENDED_VIDEOS = [
  {
    title: 'Morning Stretch Routine',
    description:
      'A gentle 10-minute stretch session to wake up your body and boost flexibility.',
    created_at: '30/06/2025',
    language: 'English',
    image: images.recommended_videos.exercise_one,
  },
  {
    title: 'Beginner Strength Training',
    description:
      'A simple strength workout to help beginners build muscle with minimal equipment.',
    created_at: '30/06/2025',
    language: 'English',
    image: images.recommended_videos.exercise_two,
  },
  {
    title: 'Cardio Burn Workout',
    description:
      'A 25-minute cardio routine to improve stamina and burn calories effectively.',
    created_at: '30/06/2025',
    language: 'English',
    image: images.recommended_videos.exercise_one,
  },
  {
    title: 'Entrenamiento de abdominales en casa',
    description:
      'Rutina rápida de abdominales para fortalecer tu core sin necesidad de equipo.',
    created_at: '30/06/2025',
    language: 'Spanish',
    image: images.recommended_videos.exercise_two,
  },
  {
    title: 'Séance de récupération active',
    description:
      'Un entraînement léger pour favoriser la récupération et réduire les douleurs musculaires.',
    created_at: '30/06/2025',
    language: 'French',
    image: images.recommended_videos.exercise_one,
  },
];

export const WORKOUT_PLANS = [
  {
    title: 'Daily Cardio Blast',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_one,
    schedule: 'Daily',
    progress: 60,
    duration: '30 mins',
    helper_text: 'Keep your heart rate up and push through!',
  },
  {
    title: 'Full-Body Strength Builder',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_two,
    schedule: 'Weekly',
    progress: 35,
    duration: '45 mins',
    helper_text: 'Focus on form, not speed. Strength comes with consistency.',
  },
  {
    title: 'Morning Mobility Flow',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_one,
    schedule: 'Daily',
    progress: 80,
    duration: '20 mins',
    helper_text: 'Start your day loose and limber!',
  },
  {
    title: 'Core Focus Challenge',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_two,
    schedule: 'Weekly',
    progress: 50,
    duration: '40 mins',
    helper_text: 'Engage your core throughout. Every rep counts!',
  },
  {
    title: 'Evening Wind-Down Yoga',
    description: 'Fitness Goal: Muscle Building',
    image: images.workout.workout_two,
    schedule: 'Daily',
    progress: 90,
    duration: '25 mins',
    helper_text: 'Breathe deeply. Let go of the day’s stress.',
  },
];

export const AUTH_TYPES = [
  {
    value: 'email',
    image: images.email,
    title: 'Send Via Email',
    description: 'Receive Verification Code via Email',
  },
  {
    value: 'phone',
    image: images.phone,
    title: 'Send Via Phone',
    description: 'Receive Verification Code via Phone Number',
  },
];

export const NEWSFEED = [
  {
    id: 1,
    user: USER,
    content: LOREM,
    reaction_count: 60,
    comment_count: 60,
  },
  {
    id: 2,
    user: USER,
    content: LOREM,
    media: [
      { type: 'image' as const, source: images.workout.workout_one },
      { type: 'image' as const, source: images.workout.workout_two },
    ],
    reaction_count: 60,
    comment_count: 60,
  },
  {
    id: 3,
    user: USER,
    poll: {
      question: 'Do you think that street A is Safe?',
      options: [
        { id: 1, label: 'Yes', percentage: 90, is_selected: true },
        { id: 2, label: 'No', percentage: 10 },
      ],
      total_votes: 150,
    },
    reaction_count: 150,
    comment_count: 20,
  },
  {
    id: 4,
    user: USER,
    measurements: {
      height: '174 cm',
      weight: '720 lbs', // Copied from image, seems high but follows design
      image: images.avatar.slim,
    },
    reaction_count: 150,
    comment_count: 20,
  },
];

export const CHATS = [
  {
    message: LOREM,
    created_at: '3 DAYS AGO',
    system: true,
  },
  {
    user: USER,
    message: LOREM,
    created_at: '3 DAYS AGO',
  },
  {
    user: USER,
    message: LOREM,
    created_at: '3 DAYS AGO',
  },
  {
    user: USER,
    message: LOREM,
    media: images.workout.workout_one,
    created_at: '3 DAYS AGO',
  },
];

export const CHAT_TYPES = [
  {
    label: 'User',
    value: 'user',
  },
  {
    label: 'Trainer',
    value: 'trainer',
  },
  {
    label: 'Doctor',
    value: 'doctor',
  },
];

export const CREATE_POST_OPTIONS = [
  {
    title: 'Video',
    icon: images.video,
  },
  {
    title: 'Photo',
    icon: images.gallery,
  },
  {
    title: 'Polling',
    icon: images.polling,
  },
];
