export interface NutritionInput {
  question: string;
}

interface NutritionRule {
  keywords: string[];
  answer: string;
}

const nutritionRules: NutritionRule[] = [
  {
    keywords: ["after workout", "post workout", "post-workout"],
    answer:
      "**Post-Workout Nutrition:**\n\n• Eat within 30–60 minutes after training\n• **Protein:** 20–40g (chicken, whey shake, eggs, Greek yogurt)\n• **Carbs:** 40–80g to replenish glycogen (rice, oats, banana, sweet potato)\n• **Hydrate:** Drink 500ml+ water to replace lost fluids\n\n*Example meal:* Grilled chicken breast + white rice + vegetables",
  },
  {
    keywords: ["before workout", "pre workout", "pre-workout"],
    answer:
      "**Pre-Workout Nutrition:**\n\n• Eat 1–2 hours before training\n• **Carbs:** 30–60g for energy (oats, banana, whole grain toast)\n• **Protein:** 15–25g (eggs, Greek yogurt, protein shake)\n• **Avoid:** High fat/fiber foods right before — they slow digestion\n\n*Example meal:* Oatmeal with banana and a boiled egg",
  },
  {
    keywords: ["protein", "how much protein", "daily protein"],
    answer:
      "**Daily Protein Recommendations:**\n\n• **General health:** 0.8g per kg bodyweight\n• **Muscle gain:** 1.6–2.2g per kg bodyweight\n• **Weight loss (preserve muscle):** 1.8–2.4g per kg bodyweight\n\n*Example for 75kg person (muscle gain):* 120–165g protein/day\n\n**Best sources:** Chicken, fish, eggs, Greek yogurt, tofu, lentils, whey protein",
  },
  {
    keywords: ["fat loss diet", "fat-loss diet", "diet for fat loss", "lose weight diet", "weight loss diet"],
    answer:
      "**Fat-Loss Diet Plan:**\n\n• **Caloric deficit:** Eat 300–500 calories below maintenance\n• **High protein:** 1.8–2.4g/kg to preserve muscle\n• **Complex carbs:** Oats, brown rice, sweet potato\n• **Healthy fats:** Avocado, olive oil, nuts (in moderation)\n• **Avoid:** Processed foods, sugary drinks, excessive alcohol\n\n**Sample Day:**\n- Breakfast: Oatmeal + eggs + fruit\n- Lunch: Grilled chicken + salad + quinoa\n- Dinner: Salmon + roasted veggies + brown rice\n- Snacks: Greek yogurt, almonds",
  },
  {
    keywords: ["muscle gain diet", "bulking diet", "build muscle diet"],
    answer:
      "**Muscle-Building Diet Plan:**\n\n• **Caloric surplus:** Eat 200–300 calories above maintenance\n• **Protein:** 1.6–2.2g/kg bodyweight\n• **Carbs:** 4–7g/kg to fuel workouts and recovery\n• **Healthy fats:** 0.8–1g/kg\n\n**Sample Day:**\n- Breakfast: 4 eggs + oatmeal + whole milk\n- Lunch: Chicken breast + white rice + broccoli\n- Pre-workout: Banana + protein shake\n- Dinner: Beef/salmon + sweet potato + salad\n- Before bed: Cottage cheese or casein protein",
  },
  {
    keywords: ["carbs", "carbohydrates", "should i eat carbs"],
    answer:
      "**Carbohydrates — What You Need to Know:**\n\n• Carbs are your body's **primary energy source** — don't eliminate them\n• **Good carbs:** Oats, brown rice, quinoa, sweet potato, fruits, vegetables\n• **Bad carbs:** White sugar, candy, soda, processed snacks\n• **Timing:** Eat most carbs around workouts (pre/post) for best results\n\n*General intake:* 3–5g/kg for moderate activity; up to 7g/kg for heavy training",
  },
  {
    keywords: ["calories", "how many calories", "calorie intake"],
    answer:
      "**Calorie Intake Guide:**\n\n• **Weight loss:** Maintenance − 300–500 kcal/day\n• **Maintenance:** Bodyweight (kg) × 33 (approx)\n• **Muscle gain:** Maintenance + 200–300 kcal/day\n\n*Rough estimate for 75kg active person:*\n- Maintenance: ~2,500 kcal\n- Fat loss: ~2,000–2,200 kcal\n- Muscle gain: ~2,700–2,800 kcal\n\nUse apps like MyFitnessPal to track accurately.",
  },
  {
    keywords: ["supplements", "creatine", "whey", "bcaa", "pre-workout supplement"],
    answer:
      "**Evidence-Based Supplements:**\n\n✅ **Creatine Monohydrate** — best for strength & muscle (5g/day)\n✅ **Whey Protein** — convenient protein source post-workout\n✅ **Caffeine** — improves performance (3–6mg/kg, 30–60 min before)\n✅ **Vitamin D** — essential if you're deficient\n✅ **Omega-3** — reduces inflammation, supports heart health\n\n⚠️ BCAAs are mostly unnecessary if protein intake is adequate\n\n*Always prioritize whole foods over supplements.*",
  },
  {
    keywords: ["hydration", "water", "how much water"],
    answer:
      "**Hydration Guidelines:**\n\n• **General:** 2–3 liters per day minimum\n• **Training days:** Add 500ml per hour of exercise\n• **Signs of dehydration:** Dark urine, fatigue, headaches, poor performance\n\n**Tips:**\n- Start your day with a glass of water\n- Drink 500ml 30 min before training\n- Sip water during workouts\n- Electrolytes matter after heavy sweating (sodium, potassium, magnesium)",
  },
];

export function answerNutritionQuestion(input: NutritionInput): string {
  const q = input.question.toLowerCase();

  for (const rule of nutritionRules) {
    if (rule.keywords.some((kw) => q.includes(kw))) {
      return rule.answer;
    }
  }

  return (
    "**General Fitness Nutrition Advice:**\n\n" +
    "• **Protein first:** Aim for 1.6–2g/kg bodyweight daily\n" +
    "• **Eat whole foods:** Lean meats, fish, eggs, legumes, vegetables, fruits, whole grains\n" +
    "• **Stay hydrated:** 2–3L water per day minimum\n" +
    "• **Timing matters:** Eat protein + carbs within 60 min post-workout\n" +
    "• **Limit:** Processed foods, alcohol, added sugars\n\n" +
    "Would you like specific advice on pre-workout nutrition, post-workout meals, protein intake, or a meal plan?"
  );
}
