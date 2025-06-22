import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllPrasarana } from '@/service/prasaranaService';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeAvailability = searchParams.get('includeAvailability') === 'true';

    const result = await getAllPrasarana({
      status: 'TERSEDIA'
    });

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data || []);
  } catch (error) {
    console.error('Prasarana API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 