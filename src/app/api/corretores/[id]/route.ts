export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const corretor = await prisma.corretor.findUnique({
      where: { id },
      include: {
        vendas: {
          include: {
            imovel: {
              select: {
                tipo: true,
                endereco: true,
                cidade: true,
                codigo: true
              }
            },
            lead: {
              select: {
                nome: true,
                telefone: true
              }
            }
          },
          orderBy: {
            dataPropostaInicial: 'desc'
          }
        },
        comissoes: {
          include: {
            venda: {
              select: {
                id: true,
                imovel: {
                  select: {
                    endereco: true,
                    codigo: true
                  }
                }
              }
            },
            aluguel: {
              select: {
                id: true,
                imovel: {
                  select: {
                    endereco: true,
                    codigo: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!corretor) {
      return NextResponse.json(
        { success: false, error: 'Corretor não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: corretor
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar corretor:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar corretor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const corretor = await prisma.corretor.update({
      where: { id },
      data: body
    })

    return NextResponse.json({
      success: true,
      data: corretor
    })
  } catch (error: any) {
    console.error('❌ Erro ao atualizar corretor:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao atualizar corretor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    await prisma.corretor.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Corretor excluído com sucesso'
    })
  } catch (error: any) {
    console.error('❌ Erro ao excluir corretor:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao excluir corretor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
