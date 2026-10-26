import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { photoData, locale } = await req.json();

    if (!photoData) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    // Simulate network delay for a realistic AI processing feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulated clinical observations based on the "Affect Lens" concept in the document
    const observationsEn = [
      "The patient appears to have reduced facial expressiveness, particularly around the eyes and mouth. This may indicate low energy or flat affect. (Non-diagnostic observation)",
      "Observable tension in the brow and jaw area. The patient's expression appears guarded. (Non-diagnostic observation)",
      "The patient shows a relatively neutral expression with minimal smiling. Eye contact in the photo appears avoidant. (Non-diagnostic observation)"
    ];

    const observationsRu = [
      "У пациента наблюдается сниженная мимическая выразительность, особенно вокруг глаз и рта. Это может указывать на низкий уровень энергии или уплощенный аффект. (Не является диагнозом)",
      "Заметное напряжение в области бровей и челюсти. Выражение лица пациента выглядит настороженным. (Не является диагнозом)",
      "Пациент демонстрирует относительно нейтральное выражение лица с минимальной улыбкой. Зрительный контакт на фото кажется избегающим. (Не является диагнозом)"
    ];

    const observations = locale === 'ru' ? observationsRu : observationsEn;
    const randomObservation = observations[Math.floor(Math.random() * observations.length)];

    return NextResponse.json({ observation: randomObservation });

  } catch (error) {
    console.error("Vision API Error:", error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}