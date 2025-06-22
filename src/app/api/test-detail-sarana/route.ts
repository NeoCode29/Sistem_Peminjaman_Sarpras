import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { peminjamanId, saranaIds } = await request.json();
    
    console.log('=== TEST DETAIL SARANA API ===');
    console.log('PeminjamanId:', peminjamanId);
    console.log('SaranaIds:', saranaIds);
    
    // Test 1: Get peminjaman with full relations
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
      include: {
        peminjamanSarana: {
          include: {
            sarana: {
              include: {
                detailSarana: {
                  where: {
                    status: {
                      in: ["TERSEDIA", "DIPINJAM"]
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    // Test 2: Get sarana directly
    const saranaList = await prisma.sarana.findMany({
      where: {
        id: { in: saranaIds }
      },
      include: {
        detailSarana: {
          where: {
            status: {
              in: ["TERSEDIA", "DIPINJAM"]
            }
          }
        }
      }
    });
    
    // Test 3: Get all detail sarana for these sarana
    const allDetailSarana = await prisma.detailSarana.findMany({
      where: {
        saranaId: { in: saranaIds }
      }
    });
    
    const result = {
      success: true,
      data: {
        peminjaman: {
          found: !!peminjaman,
          saranaCount: peminjaman?.peminjamanSarana?.length || 0,
          saranaWithDetails: peminjaman?.peminjamanSarana?.map(item => ({
            saranaId: item.saranaId,
            saranaName: item.sarana?.nama,
            jenis: item.sarana?.jenis,
            detailCount: item.sarana?.detailSarana?.length || 0,
            details: item.sarana?.detailSarana?.map(detail => ({
              id: detail.id,
              nomer_seri: detail.nomer_seri,
              status: detail.status
            })) || []
          })) || []
        },
        directSarana: {
          count: saranaList.length,
          items: saranaList.map(sarana => ({
            id: sarana.id,
            nama: sarana.nama,
            jenis: sarana.jenis,
            detailCount: sarana.detailSarana?.length || 0,
            details: sarana.detailSarana?.map(detail => ({
              id: detail.id,
              nomer_seri: detail.nomer_seri,
              status: detail.status
            })) || []
          }))
        },
        allDetailSarana: {
          count: allDetailSarana.length,
          items: allDetailSarana.map(detail => ({
            id: detail.id,
            saranaId: detail.saranaId,
            nomer_seri: detail.nomer_seri,
            status: detail.status
          }))
        }
      }
    };
    
    console.log('Test result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
} 