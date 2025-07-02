import images from "../assets/images"

export const USER = {
    first_name: "John",
    last_name: "Elbert"
}

export const PROGRESS_TRACKING = [
    {
        title: "Running Progress",
        progress: 90,
        icon: images.run
    },
    {
        title: "Fitness Progress",
        progress: 70,
        icon: images.dumbbell
    },
    {
        title: "Boxing Progress",
        progress: 40,
        icon: images.kabaddi
    },
    {
        title: "Workout Progress",
        progress: 10,
        icon: images.martial_arts
    },
]

export const RECOMMENDED_VIDEOS = [
    {
        title: "Morning Stretch Routine",
        description: "A gentle 10-minute stretch session to wake up your body and boost flexibility.",
        date: "30/06/2025",
        language: "English",
        image: images.recommended_videos.exercise_one
    },
    {
        title: "Beginner Strength Training",
        description: "A simple strength workout to help beginners build muscle with minimal equipment.",
        date: "30/06/2025",
        language: "English",
        image: images.recommended_videos.exercise_two
    },
    {
        title: "Cardio Burn Workout",
        description: "A 25-minute cardio routine to improve stamina and burn calories effectively.",
        date: "30/06/2025",
        language: "English",
        image: images.recommended_videos.exercise_one
    },
    {
        title: "Entrenamiento de abdominales en casa",
        description: "Rutina rápida de abdominales para fortalecer tu core sin necesidad de equipo.",
        date: "30/06/2025",
        language: "Spanish",
        image: images.recommended_videos.exercise_two
    },
    {
        title: "Séance de récupération active",
        description: "Un entraînement léger pour favoriser la récupération et réduire les douleurs musculaires.",
        date: "30/06/2025",
        language: "French",
        image: images.recommended_videos.exercise_one
    }
]

export const WORKOUT_PLANS = [
    {
        title: "Daily Cardio Blast",
        description: "Fitness Goal: Muscle Building",
        image: images.workout.workout_one,
        schedule: "Daily",
        progress: 60,
        duration: "30 mins",
        helper_text: "Keep your heart rate up and push through!"
    },
    {
        title: "Full-Body Strength Builder",
        description: "Fitness Goal: Muscle Building",
        image: images.workout.workout_two,
        schedule: "Weekly",
        progress: 35,
        duration: "45 mins",
        helper_text: "Focus on form, not speed. Strength comes with consistency."
    },
    {
        title: "Morning Mobility Flow",
        description: "Fitness Goal: Muscle Building",
        image: images.workout.workout_one,
        schedule: "Daily",
        progress: 80,
        duration: "20 mins",
        helper_text: "Start your day loose and limber!"
    },
    {
        title: "Core Focus Challenge",
        description: "Fitness Goal: Muscle Building",
        image: images.workout.workout_two,
        schedule: "Weekly",
        progress: 50,
        duration: "40 mins",
        helper_text: "Engage your core throughout. Every rep counts!"
    },
    {
        title: "Evening Wind-Down Yoga",
        description: "Fitness Goal: Muscle Building",
        image: images.workout.workout_two,
        schedule: "Daily",
        progress: 90,
        duration: "25 mins",
        helper_text: "Breathe deeply. Let go of the day’s stress."
    }
]
