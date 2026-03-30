import { NextResponse } from "next/server";

export async function GET() {
  // Clean template without instruction rows - users see instructions in a popup before downloading
  const csvHeader = "title,energyLevel,servings,ingredients,miseEnPlace,instructions";
  const example1 = `Garlic Butter Chicken,Medium,4,2 lbs chicken breast | 3 tbsp butter | 4 cloves garlic | 1 tsp salt,Dice the chicken into cubes | Mince all garlic cloves | Season chicken with salt,Melt butter in a large pan over medium heat | Sear chicken until golden about 5 min | Add garlic and cook 2 more minutes`;
  const example2 = `Simple Pasta Marinara,Low,2,8 oz spaghetti | 2 cups marinara sauce | 2 tbsp olive oil | 3 cloves garlic,Boil a large pot of salted water | Mince the garlic,Cook pasta until al dente about 8 min | Heat olive oil and saute garlic 1 min | Add marinara and simmer 5 min | Toss with pasta`;

  const csvContent = [csvHeader, example1, example2].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=prepmaster_recipe_template.csv"
    }
  });
}
