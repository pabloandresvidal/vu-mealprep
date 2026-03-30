import { NextResponse } from "next/server";

export async function GET() {
  // Simple format: use pipe (|) to separate list items, use semicolons (;) to separate ingredient parts
  const lines = [
    "title,energyLevel,servings,ingredients,miseEnPlace,instructions",
    "HOW TO FILL THIS TEMPLATE:,,,,",
    "- ingredients: use PIPE (|) to separate each ingredient. Format each as: amount unit name (e.g. 2 lbs chicken breast),,,,",
    "- miseEnPlace: use PIPE (|) to separate each prep step,,,,",
    "- instructions: use PIPE (|) to separate each cooking step,,,,",
    "DELETE THESE INSTRUCTION ROWS BEFORE UPLOADING,,,,",
    "",
    "Garlic Butter Chicken,Medium,4,2 lbs chicken breast | 3 tbsp butter | 4 cloves garlic | 1 tsp salt | 0.5 tsp pepper,Dice the chicken into cubes | Mince all garlic cloves | Season chicken with salt and pepper,Melt butter in a large pan over medium heat | Sear chicken until golden on all sides about 5 min | Add garlic and cook 2 more minutes | Serve hot",
    "Simple Pasta Marinara,Low,2,8 oz spaghetti | 2 cups marinara sauce | 2 tbsp olive oil | 3 cloves garlic | fresh basil to taste,Boil a large pot of salted water | Mince the garlic | Tear basil leaves,Cook pasta until al dente about 8 min | Heat olive oil in a separate pan | Saute garlic for 1 minute | Add marinara and simmer 5 min | Drain pasta and toss with sauce | Top with fresh basil"
  ];

  const csvContent = lines.join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=prepmaster_recipe_template.csv"
    }
  });
}
