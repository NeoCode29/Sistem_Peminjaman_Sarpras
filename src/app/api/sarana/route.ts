import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllSarana } from '@/service/saranaService';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const kategori = searchParams.get('kategori') || undefined;
    const date = searchParams.get('date');
    const includeStock = searchParams.get('includeStock') === 'true';

    const result = await getAllSarana({
      page,
      limit,
      search,
      kategori,
    });

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 500 });
    }

    // For API consumers that need simple array format
    if (includeStock) {
      return NextResponse.json(result.data?.items || []);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Sarana API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 