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
    
    // Skip header row + any instruction/blank rows
    const dataLines = lines.filter(l => {
      const trimmed = l.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith("title,")) return false; // header
      if (trimmed.startsWith("HOW TO")) return false;
      if (trimmed.startsWith("- ")) return false;
      if (trimmed.startsWith("DELETE")) return false;
      return true;
    });

    let count = 0;
    const errors: string[] = [];

    for (const line of dataLines) {
      try {
        const fields = parseCSVLine(line);
        if (fields.length < 6) { errors.push(`Skipped: not enough fields`); continue; }

        const [title, energyLevel, servings, ingredientsRaw, miseEnPlaceRaw, instructionsRaw] = fields;

        if (!title.trim()) continue;

        // Parse pipe-delimited ingredients into JSON array
        const ingredients = ingredientsRaw.split("|").map(i => {
          const trimmed = i.trim();
          if (!trimmed) return null;
          // Try to extract "amount unit name" pattern
          const match = trimmed.match(/^([\d./]+)\s*(\w+)\s+(.+)$/);
          if (match) {
            return { amount: match[1], unit: match[2], name: match[3] };
          }
          return { amount: "", unit: "", name: trimmed };
        }).filter(Boolean);

        // Parse pipe-delimited steps into JSON arrays
        const miseEnPlace = miseEnPlaceRaw.split("|").map(s => s.trim()).filter(Boolean);
        const instructions = instructionsRaw.split("|").map(s => s.trim()).filter(Boolean);

        await (prisma.recipe as any).create({
          data: {
            userId: (session.user as any).id,
            title: title.trim(),
            energyLevel: energyLevel.trim() || "Medium",
            servings: parseInt(servings) || 2,
            ingredients: JSON.stringify(ingredients),
            miseEnPlace: JSON.stringify(miseEnPlace),
            instructions: JSON.stringify(instructions)
          }
        });
        count++;
      } catch (e: any) {
        errors.push(e.message);
      }
    }

    return NextResponse.json({ count, errors: errors.length > 0 ? errors : undefined });
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
