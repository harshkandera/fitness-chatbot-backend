export interface WorkoutInput {
  goal: string;
  fitnessLevel: string;
  availableDays: number;
}

export interface WorkoutPlan {
  goal: string;
  level: string;
  days: Array<{ day: string; focus: string; exercises: string[] }>;
  tips: string[];
}

const workoutTemplates: Record<string, Record<string, WorkoutPlan>> = {
  "weight loss": {
    beginner: {
      goal: "Weight Loss",
      level: "Beginner",
      days: [
        { day: "Day 1", focus: "Full Body + Cardio", exercises: ["20 min brisk walk", "3×10 squats", "3×10 push-ups (knee)", "3×15 crunches"] },
        { day: "Day 2", focus: "Cardio", exercises: ["30 min jogging/cycling", "3×20 jumping jacks", "3×15 high knees"] },
        { day: "Day 3", focus: "Rest / Light Stretch", exercises: ["10 min yoga or stretching"] },
        { day: "Day 4", focus: "Full Body", exercises: ["3×10 lunges", "3×10 dumbbell rows", "3×12 glute bridges", "3×15 bicycle crunches"] },
        { day: "Day 5", focus: "Cardio + Core", exercises: ["25 min walk/jog", "3×20 mountain climbers", "2×30s plank"] },
      ],
      tips: ["Maintain a 300–500 calorie deficit", "Drink 2–3L water daily", "Aim for 7–8 hours sleep"],
    },
    intermediate: {
      goal: "Weight Loss",
      level: "Intermediate",
      days: [
        { day: "Day 1", focus: "HIIT + Upper Body", exercises: ["20 min HIIT", "4×12 push-ups", "4×10 dumbbell rows", "3×15 tricep dips"] },
        { day: "Day 2", focus: "Lower Body", exercises: ["4×15 squats", "4×12 lunges", "3×12 Romanian deadlifts", "3×20 calf raises"] },
        { day: "Day 3", focus: "Cardio", exercises: ["40 min steady-state cardio", "3×20 burpees"] },
        { day: "Day 4", focus: "Core + Abs", exercises: ["4×20 crunches", "3×30s plank", "3×15 leg raises", "3×20 Russian twists"] },
        { day: "Day 5", focus: "Full Body Circuit", exercises: ["5 rounds: 10 squats, 10 push-ups, 10 rows, 10 burpees"] },
        { day: "Day 6", focus: "Active Recovery", exercises: ["30 min walk or yoga"] },
      ],
      tips: ["Track macros — aim for high protein", "Limit processed foods", "Include 2–3 HIIT sessions per week"],
    },
  },
  "muscle gain": {
    beginner: {
      goal: "Muscle Gain",
      level: "Beginner",
      days: [
        { day: "Day 1", focus: "Chest + Triceps", exercises: ["4×8 bench press / push-ups", "3×10 incline dumbbell press", "3×12 tricep dips", "3×15 overhead tricep extension"] },
        { day: "Day 2", focus: "Back + Biceps", exercises: ["4×8 pull-ups / lat pulldown", "3×10 dumbbell rows", "3×12 barbell curls", "3×15 hammer curls"] },
        { day: "Day 3", focus: "Rest", exercises: ["Light stretching or rest"] },
        { day: "Day 4", focus: "Legs", exercises: ["4×10 squats", "3×10 leg press", "3×12 Romanian deadlifts", "4×15 calf raises"] },
        { day: "Day 5", focus: "Shoulders + Core", exercises: ["4×10 overhead press", "3×12 lateral raises", "3×15 face pulls", "3×20 crunches"] },
      ],
      tips: ["Eat 0.8–1g protein per lb bodyweight", "Progressive overload — increase weight weekly", "Rest 48h between same muscle groups"],
    },
    intermediate: {
      goal: "Muscle Gain",
      level: "Intermediate",
      days: [
        { day: "Day 1", focus: "Chest + Triceps", exercises: ["5×8 bench press", "4×10 incline dumbbell press", "4×12 cable flyes", "3×12 skull crushers", "3×15 rope pushdown"] },
        { day: "Day 2", focus: "Back + Biceps", exercises: ["5×6 deadlifts", "4×10 weighted pull-ups", "4×10 T-bar rows", "3×12 EZ bar curls", "3×15 concentration curls"] },
        { day: "Day 3", focus: "Legs", exercises: ["5×8 squats", "4×10 leg press", "4×10 hack squats", "3×12 leg curls", "4×20 calf raises"] },
        { day: "Day 4", focus: "Shoulders", exercises: ["4×10 military press", "4×12 lateral raises", "3×12 rear delt flyes", "3×10 shrugs"] },
        { day: "Day 5", focus: "Arms + Core", exercises: ["4×10 barbell curls", "4×10 tricep dips", "3×12 hammer curls", "3×30s plank", "3×20 hanging leg raises"] },
        { day: "Day 6", focus: "Active Recovery / Cardio", exercises: ["20 min low-intensity cardio", "Foam rolling"] },
      ],
      tips: ["Eat in a 200–300 calorie surplus", "Prioritize compound lifts", "Track progressive overload weekly"],
    },
  },
  endurance: {
    beginner: {
      goal: "Improve Endurance",
      level: "Beginner",
      days: [
        { day: "Day 1", focus: "Easy Run", exercises: ["20–25 min easy jog (conversational pace)"] },
        { day: "Day 2", focus: "Cross Training", exercises: ["30 min cycling or swimming", "10 min core work"] },
        { day: "Day 3", focus: "Rest or Walk", exercises: ["30 min brisk walk"] },
        { day: "Day 4", focus: "Interval Run", exercises: ["5 min warm-up", "6×1 min fast / 2 min recovery", "5 min cool-down"] },
        { day: "Day 5", focus: "Long Slow Run", exercises: ["30–40 min at easy pace"] },
      ],
      tips: ["Increase weekly mileage by 10% max", "Focus on breathing rhythm", "Hydrate before, during, after runs"],
    },
    intermediate: {
      goal: "Improve Endurance",
      level: "Intermediate",
      days: [
        { day: "Day 1", focus: "Tempo Run", exercises: ["10 min warm-up", "20 min at tempo pace", "10 min cool-down"] },
        { day: "Day 2", focus: "Strength + Core", exercises: ["3×12 squats", "3×10 lunges", "3×15 core circuit"] },
        { day: "Day 3", focus: "Easy Recovery Run", exercises: ["30 min easy jog"] },
        { day: "Day 4", focus: "Interval Training", exercises: ["10×400m repeats with 90s rest"] },
        { day: "Day 5", focus: "Cross Training", exercises: ["45 min cycling or swimming"] },
        { day: "Day 6", focus: "Long Run", exercises: ["50–60 min at easy pace"] },
      ],
      tips: ["Include 1 long run per week", "Practice fueling strategy for longer sessions", "Prioritize recovery and sleep"],
    },
  },
};

export function generateWorkoutPlan(input: WorkoutInput): WorkoutPlan {
  const goalKey = normalizeGoal(input.goal);
  const levelKey = normalizeFitnessLevel(input.fitnessLevel);

  const template = workoutTemplates[goalKey]?.[levelKey];
  if (template) {
    const days = template.days.slice(0, input.availableDays);
    if (input.availableDays < template.days.length) {
      days.push({ day: `Day ${input.availableDays + 1}–7`, focus: "Rest", exercises: ["Full rest or light stretching"] });
    }
    return { ...template, days };
  }

  return {
    goal: input.goal,
    level: input.fitnessLevel,
    days: [
      { day: "Day 1", focus: "Full Body", exercises: ["3×10 squats", "3×10 push-ups", "3×10 rows", "20 min cardio"] },
      { day: "Day 2", focus: "Rest", exercises: ["Light stretching or yoga"] },
    ],
    tips: ["Stay consistent", "Eat well and sleep 8 hours", "Hydrate throughout the day"],
  };
}

function normalizeGoal(goal: string): string {
  const lower = goal.toLowerCase();
  if (lower.includes("weight") || lower.includes("fat") || lower.includes("lose")) return "weight loss";
  if (lower.includes("muscle") || lower.includes("bulk") || lower.includes("gain")) return "muscle gain";
  if (lower.includes("endurance") || lower.includes("cardio") || lower.includes("run")) return "endurance";
  return "weight loss";
}

function normalizeFitnessLevel(level: string): string {
  const lower = level.toLowerCase();
  if (lower.includes("inter") || lower.includes("advanced")) return "intermediate";
  return "beginner";
}
