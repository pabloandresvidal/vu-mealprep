import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return new NextResponse("No file provided", { status: 400 });

    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    
    // Skip header row
    const dataLines = lines.slice(1);
    let count = 0;

    for (const line of dataLines) {
      try {
        // Parse CSV line (handles quoted fields)
        const fields = parseCSVLine(line);
        if (fields.length < 6) continue;

        const [title, energyLevel, servings, ingredients, miseEnPlace, instructions] = fields;

        await (prisma.recipe as any).create({
          data: {
            userId: (session.user as any).id,
            title: title.trim(),
            energyLevel: energyLevel.trim() || "Medium",
            servings: parseInt(servings) || 2,
            ingredients: ingredients.trim(),
            miseEnPlace: miseEnPlace.trim(),
            instructions: instructions.trim()
          }
        });
        count++;
      } catch (e) {
        console.error("Skipping row:", e);
      }
    }

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return new NextResponse(error.message || "Upload failed", { status: 500 });
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
