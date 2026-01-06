import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    openai: !!process.env.OPENAI_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY,
  });
}

