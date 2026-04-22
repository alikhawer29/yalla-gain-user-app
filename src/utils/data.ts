import images from '../assets/images';

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

export const PROGRESS_TRACKING = [
  {
    title: 'Running Progress',
    progress: 80,
    icon: images.run,
  },
  {
    title: 'Fitness Progress',
    progress: 90,
    icon: images.dumbbell,
  },
  {
    title: 'Boxing Progress',
    progress: 100,
    icon: images.kabaddi,
  },
  {
    title: 'Workout Progress',
    progress: 10,
    icon: images.martial_arts,
  },
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
