import { NextResponse } from "next/server";

export async function GET() {
  const csvHeader = "title,energyLevel,servings,ingredients,miseEnPlace,instructions";
  const csvExample = `"Garlic Butter Chicken","Medium",4,"[{""name"":""Chicken breast"",""amount"":""2"",""unit"":""lbs""},{""name"":""Butter"",""amount"":""3"",""unit"":""tbsp""},{""name"":""Garlic"",""amount"":""4"",""unit"":""cloves""}]","[""Dice the chicken"",""Mince the garlic""]","[""Melt butter in pan"",""Sear chicken until golden"",""Add garlic and cook 2 min""]"`;

  const csvContent = csvHeader + "\n" + csvExample;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=prepmaster_recipe_template.csv"
    }
  });
}
